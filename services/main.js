
const depManager = require("../core/depManager");
const responser = require("../core/responser");
const { generateTokens } = require("./token");

async function fetchMainData(req, res) {
    try{
        const userId = req.userId;

        const [user] = await Promise.all([
            await depManager.USER.getUserModel().findById(userId)
        ]);
        
        const token = generateTokens(userId)
        
        return responser.success(res, {user, token}, "MAIN_S001")
    }catch(error){
        return responser.success(res, null, "MAIN_E001")
    }
}

module.exports = {
    fetchMainData
}