const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _virtualBackgroundSchema = new Schema({
    large: {
        type: String,
        required: true
    },
    normal: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
});

const getVirtualBackgroundModel = () => {
    return mongoose.model("VirtualBackgrounds", _virtualBackgroundSchema, "VirtualBackgrounds");
};

module.exports = {
    getVirtualBackgroundModel
};