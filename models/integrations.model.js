const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _integrationssSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    integrationId: {
        type: String,
        required: true
    },
    meta: {
        type: Object,
        default: null
    },
    accessToken: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    scope: {
        type: String,
        default: null
    },
    server: {
        type: String,
        default: null
    }
})

const getIntegrationsModel = () => {
    return mongoose.model("Integrations", _integrationssSchema, "Integrations");
};

module.exports = {
    getIntegrationsModel
};