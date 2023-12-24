
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/contact');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.use(validateAccessToken);

app.post("/contact", processHandler(service.create));
app.post("/contact-request", processHandler(service.createRequest));
app.get("/contact", processHandler(service.get));
app.get("/user-contacts", processHandler(service.getUserContacts));
app.delete("/contact", processHandler(service.deleteContact));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});