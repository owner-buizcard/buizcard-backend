
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/subscription');
const cors_origin = require("../core/cors_origin");
// const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

// app.use(validateAccessToken);

app.post("/subscription-plan", processHandler(service.createPlan));
app.get("/subscription-plan", processHandler(service.getPlans));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});