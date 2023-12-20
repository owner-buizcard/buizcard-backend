const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/card-log');
const cors_origin = require("../core/cors_origin");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.post("/card-log", processHandler(service.addCardLog));

const { validateAccessToken } = require('../middlewares/authenticate');
app.use(validateAccessToken);

app.get("/card-log", processHandler(service.getCardLog));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});