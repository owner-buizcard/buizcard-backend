const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _analyticsSchema = new Schema({
    cardId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    uniqueVisitCount: {
        type: Number,
        default: 0
    },
    savedCount: {
        type: Number,
        default: 0
    },
    sharedCount: {
        type: Number,
        default: 0
    },
    connectedCount: {
        type: Number,
        default: 0
    },
    webClickCount: {
        type: Number,
        default: 0 
    }
})

const getAnalyticsModel = () => {
    return mongoose.model("CardAnalytics", _analyticsSchema, "CardAnalytics");
};

module.exports = {
    getAnalyticsModel
};