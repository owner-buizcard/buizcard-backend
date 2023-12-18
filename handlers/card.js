
const dotenv = require('dotenv')
dotenv.config()

const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");

const service = require('../services/card');
const cors_origin = require("../core/cors_origin");
const { validateAccessToken } = require('../middlewares/authenticate');


// const { initializeFirebase } = require('../core/firebase-config');

const fileUpload = require('express-fileupload');
// 
const app = express();

app.use(fileUpload({
    limits: { fileSize: 4 * 1024 * 1024 },
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

// app.use(initializeFirebase);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.get("/card-preview", processHandler(service.get));

// app.use(validateAccessToken);

app.post("/card", processHandler(service.create));
app.put("/card", processHandler(service.update));
app.get("/card", processHandler(service.get));
app.get("/user-cards", processHandler(service.getUserCards));
app.delete("/card", processHandler(service.deleteCard));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});