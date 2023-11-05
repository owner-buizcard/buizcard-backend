const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _backgroundSchema = new Schema({
    name: {
        type: String,
        default: null
    }
})

const getBackgroundModel = () => {
    return mongoose.model("Backgrounds", _backgroundSchema, "Backgrounds");
};

module.exports = {
    getBackgroundModel
};