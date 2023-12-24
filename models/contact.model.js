const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _contactSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    cardId: {
        type: Schema.Types.ObjectId,
        default: null
    },
    details: {
        type: Object,
        default: null
    },
    type: {
        type: String,
        default: "Bizcard"
    },
    status: {
        type: String,
        default: "active"
    },
    connectedAt: { 
        type: Date, 
        default: Date.now 
    },
    connectedBy: { 
        type: Schema.Types.ObjectId,
        default: null
    }
})

const getContactModel = () => {
    return mongoose.model("Contacts", _contactSchema, "Contacts");
};

module.exports = {
    getContactModel
};