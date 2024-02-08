const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function saveMessage(req, res){

  try{
    const userId = req.userId;
    const { type, message } = req.body;

    const data = { userId, type, message };
    await depManager.SUPPORT.getSupportModel().create(data);

    return responser.success(res, true, "SIGNATURE_S001");
  }catch(error){
    return responser.error(res, null);
  } 
}

module.exports = {
  saveMessage
}