
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/integrations');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.use(validateAccessToken);

app.post("/zoho/connect", processHandler(service.connectZohoCrm));
app.post("/hubspot/connect", processHandler(service.connectHubspotCrm));


module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});