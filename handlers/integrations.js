
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");
const configurePassport = require("../middlewares/integration-config")
const sessionMiddleware = require("../middlewares/session-init")

const service = require('../services/integrations');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.use(sessionMiddleware);

const passport = configurePassport();
app.use(passport.initialize());
app.use(passport.session());

const passportMiddleware = (req, res, next) => {
    req.passport = passport; 
    next();
};

app.get("/pipedrive/connect", passportMiddleware, processHandler(service.authPipedrive));
app.get(
    "/i/pipedrive/callback",  
    passport.authenticate('pipedrive', { failureRedirect: `${process.env.DOMAIN}/i/pipedrive/callback` }), 
    processHandler(service.connectPipedrive));

app.get("/spreadsheet/connect", passportMiddleware, processHandler(service.authSpreadSheet));
app.get(
    "/i/spreadsheet/callback",  
    passport.authenticate('google', { failureRedirect: `${process.env.DOMAIN}/i/spreadsheet/callback` }), 
    processHandler(service.connectSpreadSheet));

app.use(validateAccessToken);

app.post("/zoho/connect", processHandler(service.connectZohoCrm));
app.post("/hubspot/connect", processHandler(service.connectHubspotCrm));


module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});