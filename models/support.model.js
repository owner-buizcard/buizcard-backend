const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _supportSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

const getSupportModel = () => {
    return mongoose.model("Support", _supportSchema, "Support");
};

module.exports = {
  getSupportModel
};