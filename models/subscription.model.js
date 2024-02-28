const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const _planSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: {
    type: Object,
    required: true
  },
  offer: {
    type: String,
    required: true
  },
  price: {
    type: {
      m: {
        amount: {
          type: String,
          required: true
        },
        amount_string: {
          type: String,
          required: true
        }
      },
      y: {
        amount: {
          type: String,
          required: true
        },
        amount_string: {
          type: String,
          required: true
        }
      }
    },
    required: true
  }
})

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

const getPlanModel = () => {
    return mongoose.model("Plans", _planSchema, "Plans");
};

const getSubscriptionModel = () => {
  return mongoose.model("Subscription", _subscriptionSchema, "Subscription");
};


module.exports = {
  getSubscriptionModel,
  getPlanModel
};