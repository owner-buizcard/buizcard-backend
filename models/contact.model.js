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
    isFavourite: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: "Buizcard"
    },
    status: {
        type: String,
        default: "active"
    },
    tags: {
        type: Object,
        default: []
    },
    notes: {
        type: String,
        default: null
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