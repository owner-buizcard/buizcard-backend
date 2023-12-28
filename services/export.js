const { default: axios } = require("axios");
const depManager = require("../core/depManager");
const responser = require("../core/responser");
const hubspot = require('@hubspot/api-client')

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
        const { contacts } = req.body;

        const zoho = await depManager.INTEGRATIONS.getIntegrationsModel().findOne({ userId, integrationId: "zoho_crm" });
        const domain = zoho.server.split('.').filter(Boolean).pop();

        await createContactsInZoho(zoho, domain, contacts, userId);

        responser.success(res, true, "EXPORT_S001");
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
            throw new Error("Failed to create contacts in Zoho CRM");
        }
    } catch (error) {
        if (error.response && error.response.status === 401 && error.response.data && error.response.data.code === "INVALID_TOKEN") {
            const accessToken = await getZohoAccessToken(zoho.refreshToken, zoho.server);
            headers.Authorization = `Zoho-oauthtoken ${accessToken}`;
            
            const [ response ] = await Promise.all([
                makeZohoRequest(zoho, domain, "Leads", contacts, headers),
                depManager.INTEGRATIONS.getIntegrationsModel().updateOne({userId, integrationId: "zoho_crm"}, {accessToken})
            ])

            if (response.status !== 201) {
                throw new Error("Failed to create contacts in Zoho CRM");
            }
        } else {
            throw error;
        }
    }
}

async function makeZohoRequest(zoho, domain, endpoint, data, headers) {

    const url = `https://www.zohoapis.${domain}/crm/v2/${endpoint}`;
    return axios.post(url, { data }, { headers });
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
