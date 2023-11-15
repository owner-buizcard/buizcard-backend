
const dotenv = require('dotenv')
dotenv.config()

const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/analytics');
const cors_origin = require("../core/cors_origin");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.put("/analytics", processHandler(service.update));

const { validateAccessToken } = require('../middlewares/authenticate');
app.use(validateAccessToken);

app.put("/analytics", processHandler(service.get));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});