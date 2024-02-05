const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _subscriptionSchema = new Schema({
    userId: {
      type: Schema.ObjectId,
      required: true
    },
    planId: {
      type: String,
      required: true
    },
    razorpay: {

      orderId: {
        type: String,
        required: true
      },
      paymentId: {
        type: String,
        required: true
      },
      signature: {
        type: String,
        required: true
      }

    },
    startAt: { type: Date, default: Date.now },
    endAt: { type: Date, required: true }
})

const getSubscriptionModel = () => {
    return mongoose.model("Subscription", _subscriptionSchema, "Subscription");
};

module.exports = {
  getSubscriptionModel
};