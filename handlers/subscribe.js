
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/subscribe');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());


app.use(validateAccessToken);

app.post("/order", processHandler(service.createOrder));
app.post("/subscribe", processHandler(service.subscribe));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});