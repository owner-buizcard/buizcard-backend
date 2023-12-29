const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _userSchema = new Schema({
    firstName: {
        type: String,
        default: null,
        maxLength: 20
    },
    lastName: {
        type: String,
        default: null,  
        maxLength: 40
    },
    displayName: {
        type: String,
        default: null,  
        maxLength: 40
    },
    designation: {
        type: String,
        default: null,
    },
    gender: {
        enum: ["Male", "Female", "Non-Binary", "Prefer not to Answer"],
        type: String, 
        default: null
    },
    dateOfBirth: {
        type: Date, 
        default: null
    },
    companyName: {
        type: String,
        default: null,
    },
    companyWebsite: {
        type: String,
        default: null,
    },
    address: {
        addressLine1: {
            type: String,
            default: null
        },
        state: {
            type: String,
            default: null
        },
        country: {
            type: String,
            default: null
        }
    },
    picture: {
        type: String,
        default: null,
    },
    phoneNumber: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null,
        maxLength: 320
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    additionalEmail: {
        type: String,
        default: null,
        maxLength: 320
    },
    additionalPhoneNumber: {
        type: String,
        default: null
    },
    whatsappNumber: {
        type: String,
        default: null
    },
    telegramNumber: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        default: null
    },
    providerId: {
        type: String,
        default: null
    },
    registrationStatus: {
        type: String,
        default: 'unknown'
    },
    locale: {
        type: String,
        default: "en",
    },
    countryCode: {
        type: String,
        default: "IN"
    },
    dateFormat: {
        type: String,
        default: "dd/mm/yyyy"
    },
    defaultCurrency: {
        type: String,
        default: "INR"
    },
    notificationsRead: {
        type: Date,
        default: Date.now
    },
    notificationsCount: {
        type: Number,
        default: 0
    },
    integrations: {
        type: Object,
        default: []
    },
    lastLogin: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    deleted: { type: Date, default: null }
});

const getUserModel = () => {
    return mongoose.model("Users", _userSchema, "Users");
};

module.exports = {
    getUserModel
};