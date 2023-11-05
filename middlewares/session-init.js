const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
});

module.exports = sessionMiddleware;
