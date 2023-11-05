const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _contactSchema = new Schema({
    cardName: {
        type: String,
        default: null
    },
    name: {
        firstName: {
            type: String,
            default: null
        },
        middleName: {
            type: String,
            default: null
        },    
        lastName: {
            type: String,
            default: null
        },
        maidenName: {
            type: String,
            default: null
        },
        preferredName: {
            type: String,
            default: null
        },
        prefix: {
            type: String,
            default: null
        },
        suffix: {
            type: String,
            default: null
        }
    },    
    accreditations: {
        type: String,
        default: null
    },
    picture: {
        type: String,
        default: null
    },
    logo: {
        type: String,
        default: null
    },
    badges: {
        type: Object,
        default: []
    },
    company: {
        title: {
            type: String,
            default: null
        },
        department: {
            type: String,
            default: null
        },
        company: {
            type: String,
            default: null
        },
        headline: {
            type: String,
            default: null
        }
    },
    fields: {
        type: Object,
        default: []
    },
    design: {
        type: String,
        enum: ["classic", "modern", "sleek", "flat"],
        default: "classic"
    },
    theme: {
        primaryColor: {
            type: String,
            default: "#3BB"
        },
        primaryAccent: {
            type: String,
            default: "#FFF"
        },
        secondaryColor: {
            type: String,
            default: "#1AB"
        },
        secondaryAccent: {
            type: String,
            default: "#FFF"
        }
    },

})

const getContactModel = () => {
    return mongoose.model("Contacts", _contactSchema, "Contacts");
};

module.exports = {
    getContactModel
};