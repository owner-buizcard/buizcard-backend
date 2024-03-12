const { default: axios } = require("axios");
const depManager = require("../core/depManager");
const responser = require("../core/responser");
const hubspot = require('@hubspot/api-client')
const { default: mongoose } = require("mongoose");

// Spreadsheet
async function spreadSheetExport(req, res) {
    try {
        const { userId } = req;
        const { contactIds } = req.body;

        const ss = await depManager.INTEGRATIONS.getIntegrationsModel().findOne({ userId, integrationId: "spreadsheet" });
        
        await createContactsInSpreadsheet(ss, contactIds, userId)

        responser.success(res, true, "EXPORT_S003");
    } catch (error) {
        handleError(error, res);
    }
}

async function getSpreadsheetAccessToken(refreshToken) {
    const tokenURL = 'https://oauth2.googleapis.com/token';
    const response = await axios.post(tokenURL, {
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
    });

    return response.data?.access_token;
}

async function createContactsInSpreadsheet(ss, contactIds, userId) {

    try {
        await makeSpreadsheetRequest(contactIds, ss.accessToken, ss.meta, userId);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const accessToken = await getSpreadsheetAccessToken(ss.refreshToken);
            await Promise.all([
                makeSpreadsheetRequest(contactIds, accessToken, ss.meta),
                depManager.INTEGRATIONS.getIntegrationsModel().updateOne({userId, integrationId: "spreadsheet"}, {accessToken})
            ]);
        }
    }
}

async function makeSpreadsheetRequest(contactIds, accessToken, meta, userId) {

    let spreadsheetId;
    
    if(meta && meta.spreadsheetId){
        spreadsheetId = meta.spreadsheetId;
    }else{
        spreadsheetId = await getSpreadsheetId(accessToken, userId);
    }

    const contacts = await fetchContacts(contactIds);

    let values = contacts.map(item => {

        const card = item.card;
        const details = item.details;
        if(card){
            return [
                card.name ? `${card.name.firstName} ${card.name.lastName}` : '', 
                card.email || '',
                card.phoneNumber || '',
                card.address ? `${card.address?.addressLine1}` : '',
                card.address ? `${card.address?.city}` : '',
                card.address ? `${card.address?.state}` : '',
                card.address ? `${card.address?.country}` : '',
                card.address ? `${card.address?.pincode}` : '',
                card.company ? `${card.company?.companyName}` : '',
                card.company ? `${card.company?.companyWebsite}` : '',
                card.company ? `${card.company?.title}` : '',
            ];
        }else{
            return [
                details.name || '', 
                details.email || '',
                details.phone || '',
                details.location,
                '',
                '',
                '',
                '',
                details?.company || '',
                details?.website || '',
                details?.title || ''
            ];
        }

      });

    const currentDate = new Date();
    const formatted = currentDate.toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'})

    values = [ 
        [""], 
        ["Date", formatted],
        ["Name", "Email", "Phone", "Address", "City", "State", "Country", "Pincode", "Company Name", "Website", "Title"],
        ...values
    ]

    const range = `Sheet1!A1:Z`;
    const endPoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=OVERWRITE&key=${process.env.GOOGLE_API_KEY}`;
    const data = {values: values};
    const header = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };
    const response = await axios.post(endPoint, data, header);
    return response;
}

async function getSpreadsheetId(accessToken, userId){
    const requestBody = {
        properties: {
          title: 'Bizcard Contacts'
        }
    };

    const response = await axios.post(`https://sheets.googleapis.com/v4/spreadsheets?key=${process.env.GOOGLE_API_KEY}`, requestBody, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    const spreadsheetId = response.data.spreadsheetId;

    console.log(spreadsheetId);

    await depManager.INTEGRATIONS.getIntegrationsModel().updateOne({userId, integrationId: "spreadsheet"}, {meta: {spreadsheetId}})

    return spreadsheetId;
}


// HUBSPOT

async function hubspotExport(req, res) {
    try {
        const { userId } = req;
        const { contactIds } = req.body;

        const hub = await depManager.INTEGRATIONS.getIntegrationsModel().findOne({ userId, integrationId: "hubspot_crm" });

        await createContactsInHubspot(hub, contactIds, userId);

        responser.success(res, true, "EXPORT_S002");
    } catch (error) {
        handleError(error, res);
    }
}

async function createContactsInHubspot(hub, ids, userId) {

    try {
        await makeHubspotRequest(ids, hub.accessToken);
    } catch (error) {
        if (error.code === 401) {
            const accessToken = await getHubspotAccessToken(hub.refreshToken);
            await Promise.all([
                makeHubspotRequest(ids, accessToken),
                depManager.INTEGRATIONS.getIntegrationsModel().updateOne({userId, integrationId: "hubspot_crm"}, {accessToken})
            ]);
        }
    }
}

async function makeHubspotRequest(ids, accessToken) {
    const hubspotClient = new hubspot.Client({ accessToken: accessToken })
    const contacts = await fetchContacts(ids);
    const [response] = await Promise.all(contacts.map(async (contact) => {
        const data = formatContactForhubspot(contact);
        const obj = { properties: data };
        return await hubspotClient.crm.contacts.basicApi.create(obj);
    }));
    return response;
}

async function getHubspotAccessToken(refreshToken) {
    const tokenEndpoint = `https://api.hubapi.com/oauth/v1/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", process.env.HUBSPOT_CLIENT_ID);
    params.append("client_secret", process.env.HUBSPOT_CLIENT_SECRET);
    params.append("refresh_token", refreshToken);

    const response = await axios.post(tokenEndpoint, params);
    return response.data.access_token;
}

// ZOHO

async function zohoExport(req, res) {
    try {
        const { userId } = req;
        const { contactIds } = req.body;
        const [zoho, contacts] = await Promise.all([
            depManager.INTEGRATIONS.getIntegrationsModel().findOne({ userId, integrationId: "zoho_crm" }),
            fetchContacts(contactIds)
        ])
        const domain = zoho.server.split('.').filter(Boolean).pop();
        var result = await createContactsInZoho(zoho, domain, contacts, userId);
        responser.success(res, true, "EXPORT_S001");
    } catch (error) {
        handleError(error, res);
    }
}

async function fetchContacts(contactIds){

    let condition = [];

    if (contactIds.length > 0) {
        condition.push({
            $match: { 
                _id: { $in: contactIds.map(id => new mongoose.Types.ObjectId(id)) }
            }
        });
    }
    condition.push(
        {
            $lookup: {
                from: 'Cards',
                localField: 'cardId',
                foreignField: '_id',
                as: 'card'
            }
        },
        {
            $unwind: {
                path: '$card',
                preserveNullAndEmptyArrays: true 
            }
        },
        {
            $addFields: {
                card: {
                    $ifNull: ['$card', null] 
                }
            }
        }
    );
    
    return await depManager.CONTACT.getContactModel().aggregate(condition);
}

async function createContactsInZoho(zoho, domain, contacts, userId) {
    const headers = {
        Authorization: `Zoho-oauthtoken ${zoho.accessToken}`,
        'Content-Type': 'application/json',
    };

    try {
        const response = await makeZohoRequest(zoho, domain, "Leads", contacts, headers);
        if (response.status !== 201) {
            return null;
        }
        return true;
    } catch (error) {
        if (error.response && error.response.status === 401 && error.response.data && error.response.data.code === "INVALID_TOKEN") {
            const accessToken = await getZohoAccessToken(zoho.refreshToken, zoho.server);
            headers.Authorization = `Zoho-oauthtoken ${accessToken}`;
            
            const [ response ] = await Promise.all([
                makeZohoRequest(zoho, domain, "Leads", contacts, headers),
                depManager.INTEGRATIONS.getIntegrationsModel().updateOne({userId, integrationId: "zoho_crm"}, {accessToken})
            ])

            if (response.status !== 201) {
                return null;
            }
            return true;
        } else {
            return null;
        }
    }
}

async function makeZohoRequest(zoho, domain, endpoint, data, headers) {
    const url = `https://www.zohoapis.${domain}/crm/v2/${endpoint}`;
    const contactsToExport =  data.map((contact)=>{ return formatContact(contact); })
    return axios.post(url, {"data": contactsToExport}, { headers });
}

function formatContact(contact){
    if(contact.card){
        return {
            "First_Name": contact.card.name.firstName || '',
            "Last_Name": contact.card.name.lastName || '',
            "Email": contact.card.email || '',
            "Phone": contact.card.phoneNumber || '',
            "Address": `${contact.card.address.addressLine1 || ''}, ${contact.card.address.city || ''}, ${contact.card.address.state || ''}, ${contact.card.address.country || ''}, ${contact.card.address.pincode || ''}`,
            "Company": contact.card.company.companyName || '',
            "Title": contact.card.company.title || '',
            "Description": contact.card.company.companyDescription || ''
        }
    }else{
        return {
            "First_Name": contact.details.name || '',
            "Last_Name": '',
            "Email": contact.details.email || '',
            "Phone": contact.details.phone || '',
            "Address": contact.details.location || '',
            "Company": contact.details.company || '',
            "Website": contact.details.website || '',
            "Title": contact.details.title || ''
        }
    }
}


function formatContactForhubspot(contact){
    if(contact.card){
        return {
            "firstname": contact.card.name.firstName || '',
            "lastname": contact.card.name.lastName || '',
            "email": contact.card.email || '',
            "phone": contact.card.phoneNumber || '',
            "address": `${contact.card.address.addressLine1 || ''}, ${contact.card.address.city || ''}, ${contact.card.address.state || ''}, ${contact.card.address.country || ''}, ${contact.card.address.pincode || ''}`,
            "company": contact.card.company.companyName || '',
            "job_title": contact.card.company.title || '',
            "description": contact.card.company.companyDescription || ''
        }
    }else{
        return {
            "firstname": contact.details.name || '',
            "lastname": contact.details.name || '',
            "email": contact.details.email || '',
            "phone": contact.details.phone || '',
            "address": contact.details.location || '',
            "company": contact.details.company || '',
            "website": contact.details.website || '',
            "job_title": contact.details.title || ''
        }
    }
}

async function getZohoAccessToken(refreshToken, server) {
    const tokenEndpoint = `${server}/oauth/v2/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", process.env.ZOHO_CLIENT_ID);
    params.append("client_secret", process.env.ZOHO_CLIENT_SECRET);
    params.append("refresh_token", refreshToken);
    params.append("scope", "ZohoCRM.modules.ALL");

    const response = await axios.post(tokenEndpoint, params);
    return response.data.access_token;
}

function handleError(error, res) {
    console.log(error)
    responser.error(res, null, "GLOBAL_E001");
}

module.exports = {
    zohoExport,
    hubspotExport,
    spreadSheetExport
};
