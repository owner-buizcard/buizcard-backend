
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/support');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());


app.use(validateAccessToken);

app.post("/support", processHandler(service.saveMessage));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});