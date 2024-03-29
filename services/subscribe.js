const { razorpay, generateRandomString } = require("../core/utils");
const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function createOrder(req, res){

  const { amount, currency } = req.body;

  const uniqueReceipt = `receipt#${Date.now()}-${generateRandomString(8)}`;

  const options = {
    amount: amount,
    currency: currency ?? "INR",
    receipt: uniqueReceipt,
    partial_payment: false,
    payment_capture: 1
  };

  try {
    const order = await razorpay().orders.create(options);
    return responser.success(res, order, "SUBSCRIPTION_S002");
  } catch (error) {
    console.log(error);
    return responser.success(res, null, "GLOBAL_E001");
  }
}

async function subscribe(req, res) {
  try {
    const userId = req.userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const user = await depManager.USER.getUserModel().findById(userId);

    const currentDate = new Date();
    const startAt = user.subscription!=null ? user.subscription + 1 : currentDate.getTime();
    const endAt = getEndAtDate(startAt, plan.type);

    const data = {
      userId,
      plan,
      startAt,
      endAt,
      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature
      }
    };

    user.subscription = endAt;

    const [_, updated] = await Promise.all([
      depManager.SUBSCRIPTION.getSubscriptionModel().create(data),
      user.save()
    ]);

    return responser.success(res, updated, "SUBSCRIPTION_S001");
  } catch (error) {
    console.error(error);
    return responser.success(res, null, "GLOBAL_E001");
  }
}

function getEndAtDate(currentDate, type) {
  const daysToAdd = type === "m" ? 30 : 365;
  const endAt = new Date(currentDate);
  endAt.setDate(endAt.getDate() + daysToAdd);
  return endAt.getTime();
}


module.exports = {
  createOrder,
  subscribe
}