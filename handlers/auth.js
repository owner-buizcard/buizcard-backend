

const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const processHandler = require("../core/processHandler");
const configurePassport = require("../middlewares/passport-config")
const sessionMiddleware = require("../middlewares/session-init")

const service = require('../services/auth');
const cors_origin = require("../core/cors_origin");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors_origin());

app.use(sessionMiddleware);

const passport = configurePassport();
app.use(passport.initialize());
app.use(passport.session());

const passportMiddleware = (req, res, next) => {
    req.passport = passport; 
    next();
};

app.get("/ping", (req,res)=>res.send('DONE'));

app.post("/auth/signup", processHandler(service.signupWithEmail));
app.post("/auth/login", processHandler(service.loginWithEmail));

app.get("/auth/google", passportMiddleware, processHandler(service.googleAuth));
app.get(
    "/auth/google/callback",  
    passport.authenticate('google', { failureRedirect: `https://bizcard-spiderlingz.web.app/auth/callback` }), 
    processHandler(service.googleCallback));

    app.get("/auth/github", passportMiddleware, processHandler(service.githubAuth));
app.get(
    "/auth/github/callback",  
    passport.authenticate('github', { failureRedirect: `https://bizcard-spiderlingz.web.app/auth/callback` }), 
    processHandler(service.githubCallback));

app.get("/auth/linkedin/callback", processHandler(service.linkedinAuth))

app.post("/auth/password/forgot", processHandler(service.forgotPassword));


const { validateAccessToken } = require('../middlewares/authenticate');

app.use(validateAccessToken);

app.put("/auth/password/reset", processHandler(service.resetPassword));

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});