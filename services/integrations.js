
const { default: axios } = require('axios');
const responser = require("../core/responser");
const depManager = require('../core/depManager');

async function connectZohoCrm(req, res){
    try{
        const { userId } = req;
        const { code, server } = req.body;

        const serverUrl = decodeURIComponent(server);

        const tokenEndpoint = `${serverUrl}/oauth/v2/token`;

        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("client_id", process.env.ZOHO_CLIENT_ID);
        params.append("client_secret", process.env.ZOHO_CLIENT_SECRET);
        params.append("redirect_uri", process.env.ZOHO_CALL_BACK);
    
        const response = await axios.post(tokenEndpoint, params);
        const data = response.data;

        console.log(response)

        const integration = {
            userId,
            integrationId: "zoho_crm",
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            scope: data.scope
        }

        const [created, user] = await Promise.all([
            depManager.INTEGRATIONS.getIntegrationsModel().create(integration),
            depManager.USER.getUserModel().findById(userId)
        ]);

        user.integrations.push("zoho_crm");

        await user.save();

        return responser.success(res, created, "INTEGRATION_S001");
    }catch(error){
        console.log(error);
        return responser.error(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    connectZohoCrm
}
