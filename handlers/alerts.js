

const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/alerts');
const cors_origin = require("../core/cors_origin");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

// const { validateAccessToken } = require('../middlewares/authenticate');
// app.use(validateAccessToken);

app.post("/whatsapp/alert", processHandler(service.sendWhatsappAlert));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});