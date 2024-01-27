const { default: axios } = require("axios");
const depManager = require("../core/depManager");
const responser = require("../core/responser");
const hubspot = require('@hubspot/api-client')
const Excel = require('exceljs');
const fs = require('fs');
const fsPromise = require('fs').promises;
const { default: mongoose } = require("mongoose");
const { uploadObjectToS3Bucket } = require("../core/utils");

// Csv
async function csvExport(req, res) {
    try {
        const { userId } = req;
        const { contacts } = req.body;

        const fields = Object.keys(contacts[0]);

        let csv = fields.join(',') + '\n';

        contacts.forEach(contact => {
            const row = fields.map(field => contact[field] || '').join(',');
            csv += row + '\n';
        });

        const filePath = `Bizcard.csv`;
        await fsPromise.writeFile(filePath, csv, 'utf8');

        const mimetype = 'text/csv';
        const fileData = await fsPromise.readFile(filePath);

        const fileUrl = await uploadObjectToS3Bucket(`${userId}/bizcard-contacts.csv`, mimetype, fileData);
        await fsPromise.unlink(filePath);
        const file_url = fileUrl.substring(0, fileUrl.indexOf('?'));

        responser.success(res, file_url, "EXPORT_S004");
    } catch (error) {
        handleError(error, res);
    }
}

// Excel
async function excelExport(req, res) {
    try {
        const { userId } = req;
        const { contacts } = req.body;

        let values = contacts.map(contact => {return Object.values(contact);})

        values = [ 
            [], 
            ["Name", "Email", "Phone"],
            [], 
            ...values
        ]

        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Contacts');

        values.forEach((row) => { worksheet.addRow(row); });

        const filePath = `Bizcard.xlsx`;
        await workbook.xlsx.writeFile(filePath);

        const mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const fileData = fs.readFileSync(filePath);

        const fileUrl = await uploadObjectToS3Bucket(`${userId}/bizcard-contacts.xls`, mimetype, fileData);
        fs.unlinkSync(filePath);
        const file_url = fileUrl.substring(0, fileUrl.indexOf('?'));

        responser.success(res, file_url, "EXPORT_S004");
    } catch (error) {
        handleError(error, res);
    }
}

// Spreadsheet
async function spreadSheetExport(req, res) {
    try {
        const { userId } = req;
        const { contacts } = req.body;

        const ss = await depManager.INTEGRATIONS.getIntegrationsModel().findOne({ userId, integrationId: "spreadsheet" });
        
        await createContactsInSpreadsheet(ss, contacts, userId)

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

async function createContactsInSpreadsheet(ss, contacts, userId) {

    try {
        await makeSpreadsheetRequest(contacts, ss.accessToken, ss.meta, userId);
    } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 401) {
            const accessToken = await getSpreadsheetAccessToken(ss.refreshToken);
            await Promise.all([
                makeSpreadsheetRequest(contacts, accessToken, ss.meta),
                depManager.INTEGRATIONS.getIntegrationsModel().updateOne({userId, integrationId: "spreadsheet"}, {accessToken})
            ]);
        }
    }
}

async function makeSpreadsheetRequest(contacts, accessToken, meta, userId) {

    let spreadsheetId;
    
    if(meta && meta.spreadsheetId){
        spreadsheetId = meta.spreadsheetId;
    }else{
        spreadsheetId = await getSpreadsheetId(accessToken, userId);
    }

    let values = contacts.map(contact => {return Object.values(contact);})

    values = [ 
        [], 
        ["Name", "Email", "Phone"],
        [], 
        ...values
    ]

    const range = `Sheet1!A1:C`;
    const endPoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&key=${process.env.GOOGLE_API_KEY}`;
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
        const { contacts } = req.body;

        const hub = await depManager.INTEGRATIONS.getIntegrationsModel().findOne({ userId, integrationId: "hubspot_crm" });

        await createContactsInHubspot(hub, contacts, userId);

        responser.success(res, true, "EXPORT_S002");
    } catch (error) {
        handleError(error, res);
    }
}

async function createContactsInHubspot(hub, contacts, userId) {

    try {
        await makeHubspotRequest(contacts, hub.accessToken);
    } catch (error) {
        if (error.code === 401) {
            const accessToken = await getHubspotAccessToken(hub.refreshToken);
            await Promise.all([
                makeHubspotRequest(contacts, accessToken),
                depManager.INTEGRATIONS.getIntegrationsModel().updateOne({userId, integrationId: "hubspot_crm"}, {accessToken})
            ]);
        }
    }
}

async function makeHubspotRequest(contacts, accessToken) {
    const hubspotClient = new hubspot.Client({ accessToken: accessToken })

    const [response] = await Promise.all(contacts.map(async (contact) => {
        const obj = { properties: contact };
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

        const condition = [
            {
                $match: { 
                    _id: { $in: contactIds.map(id => new mongoose.Types.ObjectId(id)) }
                }
            },
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
        ];

        const [zoho, contacts] = await Promise.all([
            depManager.INTEGRATIONS.getIntegrationsModel().findOne({ userId, integrationId: "zoho_crm" }),
            depManager.CONTACT.getContactModel().aggregate(condition)
        ])
        const domain = zoho.server.split('.').filter(Boolean).pop();
        var result = await createContactsInZoho(zoho, domain, contacts, userId);
        if(result){
            responser.success(res, true, "EXPORT_S001");
        }
        responser.error(res, false, "EXPORT_S001");
    } catch (error) {
        handleError(error, res);
    }
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

    const contactsToExport =  data.map((contact)=>{
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
                "Last_Name": contact.details.name || '',
                "Email": contact.details.email || '',
                "Phone": contact.details.phone || '',
                "Address": contact.details.location || '',
                "Company": contact.details.company || '',
                "Website": contact.details.website || '',
                "Title": contact.details.title || ''
            }
        }
    })

    return axios.post(url, {"data": contactsToExport}, { headers });
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
    spreadSheetExport,
    csvExport,
    excelExport
};
