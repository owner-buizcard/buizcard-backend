
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/user');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.use(validateAccessToken);

app.put("/me", processHandler(service.update));
app.put("/followUp", processHandler(service.updateFollowUp));
app.put("/branding", processHandler(service.updateBranding));
app.put("/verify-email", processHandler(service.updateEmailVerification));
app.put("/personalizedLink", processHandler(service.updatePersonalizedLink));
app.post("/personalizedLink/check", processHandler(service.checkDomainIsAvailable));
app.delete("/me", processHandler(service.deleteAccount));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});