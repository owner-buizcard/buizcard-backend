
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');
const processHandler = require("../core/processHandler");

const corsOrigin = require("../core/cors_origin");
const service = require("../services/token");

const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(corsOrigin());

app.post("/accessToken", processHandler(service.getAccessToken));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});