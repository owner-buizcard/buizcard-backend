const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _fieldTypesSchema = new Schema({
    label: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    regex: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
})

const _configSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
})

const getFieldTypesModel = () => {
    return mongoose.model("FieldTypes", _fieldTypesSchema, "FieldTypes");
};

const getConfigModel = () => {
    return mongoose.model("Configs", _configSchema, "Configs");
};

module.exports = {
    getFieldTypesModel,
    getConfigModel
};