// DB
const USER = require("../models/user.model");
const CARD = require("../models/card.model");
const CONTACT = require("../models/contact.model");
const ANALYTICS = require("../models/analytics.model");
const BACKGROUND = require("../models/background.model");
const CONFIG = require("../models/config.model");
const CARD_LOG = require("../models/card-log.model");

const depManager = {
  // DB
  USER,
  CARD,
  CONTACT,
  ANALYTICS,
  BACKGROUND,
  CONFIG,
  CARD_LOG
};

module.exports = depManager;
