const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _cardLogSchema = new Schema({
    cardId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    by: {
        type: Schema.Types.ObjectId,
        default: null
    },
    action: {
        type: {
            type: String,
            enum: ['unique-visit', 'webclick', 'save', 'share', 'connect'],
            required: true
        },
        prompt: {
            type: String,
            required: true
        }
    },
    created: { type: Date, default: Date.now },
})

const getCardLogModel = () => {
    return mongoose.model("CardLog", _cardLogSchema, "CardLog");
};

module.exports = {
    getCardLogModel
};