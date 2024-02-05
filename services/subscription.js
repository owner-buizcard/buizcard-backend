const Razorpay = require('razorpay');
const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function createPlan(req, res){
  try {
      const data = req.body;
      const plan = await depManager.SUBSCRIPTION.getPlansModel().create(data);
      return responser.success(res, plan, "SIGNATURE_S001");
  } catch (error) {
      return responser.error(res, error);
  }
}

async function getPlans(req, res){
  try {
      const plans = await depManager.SUBSCRIPTION.getPlansModel().find();
      return responser.success(res, plans, "SIGNATURE_S001");
  } catch (error) {
      return responser.error(res, error);
  }
}

module.exports = {
  createPlan,
  getPlans
} 