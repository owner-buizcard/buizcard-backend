const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _cardSchema = new Schema({
    cardName: {
        type: String,
        required: true
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
        prefix: {
            type: String,
            default: null
        }
    },  
    bio: {
        type: String,
        default: null
    }, 
    phoneNumber: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    address: {
        addressLine1: {
            type: String,
            default: null
        },
        addressLine2: {
            type: String,
            default: null
        },
        city: {
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
        },
        pincode: {
            type: String,
            default: null
        }
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
        companyName: {
            type: String,
            default: null
        },
        companyWebsite: {
            type: String,
            default: null
        },
        companyDescription: {
            type: String,
            default: null
        }
    },
    picture: {
        type: String,
        default: null
    },
    logo: {
        type: String,
        default: null
    },
    banner: {
        type: String,
        default: null
    },
    design: {
        type: String,
        enum: ["classic", "modern", "sleek", "flat"],
        default: "classic"
    },
    theme: {
        type: String,
        default: '#ffffff'
    },
    badges: {
        type: Object,
        default: []
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "PAUSED","DELETED"],
        default: "ACTIVE"
    },
    captureForm: {
        type: Object,
        default: {
            enable: true,
            fields: [
                { label: "Full Name", isRequired: false },
                { label: "Email", isRequired: false },
                { label: "Phone", isRequired: false },
                { label: "Message", isRequired: false }
            ],
            disclaimer: "Your data is protected by Buizcard"
        }
    },
    fields: {
        type: [{
            id: {
                type: String,
                default: null
            },
            title: {
                type: String,
                default: null
            },
            link: {
                type: String,
                default: null
            },
            icon: {
                type: String,
                default: null
            },
            highlight: {
                type: Boolean,
                default: false
            },
            desc: {
                type: String,
                default: null
            }
        }],
        default: []
    },
    qr: {
        logo: {
            type: String,
            default: null
        },
        codeStyle: {
            type: String,
            default: "dots"
        },
        eyeStyle: {
            type: String,
            default: "leaf"
        },
        fgColor: {
            type: String,
            default: "#000000"
        },
        eyeColor: {
            type: String,
            default: "#008080"
        }
    },
    cardLink: {
        type: String,
        default: null
    },
    linkPreviewImage: {
        type: String,
        default: null
    },
    qrVisible: {
        type: Boolean,
        default: false
    },
    qrWithLogo: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    deleted: { type: Date, default: null }
})

const getCardModel = () => {
    return mongoose.model("Cards", _cardSchema, "Cards");
};

module.exports = {
    getCardModel
};