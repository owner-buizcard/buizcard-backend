const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _planSchema = new Schema({
    planId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    amount_string: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    }
})

const getPlansModel = () => {
    return mongoose.model("Plans", _planSchema, "Plans");
};

module.exports = {
  getPlansModel
};