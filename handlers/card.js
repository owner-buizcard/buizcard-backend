
const dotenv = require('dotenv')
dotenv.config()

const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/card');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.use(validateAccessToken);

app.post("/card", processHandler(service.create));
app.put("/card", processHandler(service.update));
app.get("/card", processHandler(service.get));
app.get("/user-cards", processHandler(service.getUserCards));
app.delete("/card", processHandler(service.deleteCard));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});