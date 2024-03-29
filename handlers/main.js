
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/main');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.get("/config", processHandler(service.fetchConfigData));

app.use(validateAccessToken);

app.get("/main", processHandler(service.fetchMainData));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});