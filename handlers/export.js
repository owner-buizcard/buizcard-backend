
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/export');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.use(validateAccessToken);

app.post("/zoho/export", processHandler(service.zohoExport));
app.post("/hubspot/export", processHandler(service.hubspotExport));
app.post("/spreadsheet/export", processHandler(service.spreadSheetExport));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});