

const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/virtual-background');
const cors_origin = require("../core/cors_origin");
const fileUpload = require('express-fileupload');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.use(fileUpload({
    limits: { fileSize: 14 * 1024 * 1024 },
    createParentPath: true,
    abortOnLimit: true,
    limitHandler: function (req, res, next) {
        res.status(413).send({
            status: "error",
            message: "The file has exceeded the maximum file limit 4MB",
            messageCode: "PRO_E001"
        });
    },
    debug: true,
}));

app.post("/vb", processHandler(service.uploadVirtualBG));

const { validateAccessToken } = require('../middlewares/authenticate');
app.use(validateAccessToken);

app.get("/vb", processHandler(service.getVirtualBgs));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});