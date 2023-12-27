const { default: axios } = require("axios");
const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function zohoExport(req, res) {
    try {
        const { userId } = req;
        const { contacts } = req.body;

        const zoho = await depManager.INTEGRATIONS.getIntegrationsModel().findOne({ userId, integrationId: "zoho_crm" });
        const domain = zoho.server.split('.').filter(Boolean).pop();

        await createContactsInZoho(zoho, domain, contacts);

        responser.success(res, true, "CONTACT_S001");
    } catch (error) {
        handleError(error, res);
    }
}

async function createContactsInZoho(zoho, domain, contacts) {
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
            const newAccessToken = await getZohoAccessToken(zoho.refreshToken, zoho.server);
            headers.Authorization = `Zoho-oauthtoken ${newAccessToken}`;

            const response = await makeZohoRequest(zoho, domain, "Leads", contacts, headers);

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
    console.error(error);
    responser.error(res, null, "CONTACT_E001");
}

module.exports = {
    zohoExport
};
