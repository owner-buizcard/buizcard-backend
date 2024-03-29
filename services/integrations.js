
const { default: axios } = require('axios');
const responser = require("../core/responser");
const depManager = require('../core/depManager');
const { generateTokens } = require('./token');

async function connectHubspotCrm(req, res){
    try{
        const { userId } = req;
        const { code } = req.body;
        const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
        const tokenParams = {
            grant_type: 'authorization_code',
            client_id: process.env.HUBSPOT_CLIENT_ID,
            client_secret: process.env.HUBSPOT_CLIENT_SECRET,
            redirect_uri: process.env.HUBSPOT_CALL_BACK,
            code: code,
        };
        const response = await axios.post(tokenUrl, tokenParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const data = response.data;

        const integration = {
            userId,
            integrationId: "hubspot_crm",
            accessToken: data.access_token,
            refreshToken: data.refresh_token
        }

        const [created, user] = await Promise.all([
            depManager.INTEGRATIONS.getIntegrationsModel().create(integration),
            depManager.USER.getUserModel().findByIdAndUpdate(userId, {
                $addToSet: { integrations: { $each: ["hubspot_crm"] } }
            }, { new: true })
        ]);

        return responser.success(res, {user, created}, "INTEGRATION_S002");
    }catch(error){
        console.log(error);
        return responser.error(res, null, "GLOBAL_E001");
    }
}

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

        console.log(process.env.ZOHO_CALL_BACK);
    
        const response = await axios.post(tokenEndpoint, params);
        const data = response.data;

        const integration = {
            userId,
            integrationId: "zoho_crm",
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            scope: data.scope,
            server: serverUrl
        }

        const [created, user] = await Promise.all([
            depManager.INTEGRATIONS.getIntegrationsModel().create(integration),
            depManager.USER.getUserModel().findByIdAndUpdate(userId, {
                $addToSet: { integrations: { $each: ["zoho_crm"] } }
            }, { new: true })
        ]);

        return responser.success(res, {user, created}, "INTEGRATION_S001");
    }catch(error){
        console.log(error);
        return responser.error(res, null, "GLOBAL_E001");
    }
}

async function authPipedrive(req, res, next){
    const { passport } = req;
    const { userId } = req.query;

    passport.authenticate('pipedrive', { state: userId }, (err, user) => {
        if (err) {
            return next(err);
        }
        req.user = user;
        return next();
    })(req, res, next);
}

async function connectPipedrive(req, res){
    try{
        const pipedriveUser = req.user;
        const userId = req.query.state;

        console.log(pipedriveUser);
        console.log(userId);

        // const integration = {
        //     userId,
        //     integrationId: "spreadsheet",
        //     accessToken: googleUser.accessToken,
        //     refreshToken: googleUser.refreshToken
        // }

        // const [user] = await Promise.all([
        //     depManager.USER.getUserModel().findById(userId),
        //     depManager.INTEGRATIONS.getIntegrationsModel().create(integration)
        // ]);

        // user.integrations.push("spreadsheet");

        // await user.save();

        // accessToken = generateTokens(user._id).accessToken;
        res.redirect(`${process.env.DOMAIN}/i/callback/spreadsheet?token=${'accessToken'}`);
    }catch(error){
        console.log(error);
        return responser.error(res, null, "GLOBAL_E001");
    }
}

async function authSpreadSheet(req, res, next){
    const passport = req.passport;
    const {userId} = req.query;
    passport.authenticate(
        'google', 
        { 
            accessType: 'offline',
            prompt: 'consent', 
            scope: ['profile', 'email', 'https://www.googleapis.com/auth/spreadsheets'],
            state: userId 
        })(req, res, next);
}

async function connectSpreadSheet(req, res){
    try{
        const googleUser = req.user;
        const userId = req.query.state;

        const integration = {
            userId,
            integrationId: "spreadsheet",
            accessToken: googleUser.accessToken,
            refreshToken: googleUser.refreshToken
        }

        const [created, user] = await Promise.all([
            depManager.INTEGRATIONS.getIntegrationsModel().create(integration),
            depManager.USER.getUserModel().findByIdAndUpdate(userId, {
                $addToSet: { integrations: { $each: ["spreadsheet"] } }
            }, { new: true })
        ]);

        accessToken = generateTokens(user._id).accessToken;
        res.redirect(`${process.env.DOMAIN}/i/callback/spreadsheet?token=${accessToken}`);
    }catch(error){
        console.log(error);
        return responser.error(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    connectZohoCrm,
    connectHubspotCrm,
    authPipedrive,
    connectPipedrive,
    authSpreadSheet,
    connectSpreadSheet
}
