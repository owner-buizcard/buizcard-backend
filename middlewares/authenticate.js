const { verifyToken } = require("../services/token");
const responser = require("../core/responser");
async function validateAccessToken(req, res, next){

    try{
        const authHeader = req.headers.authorization;

        console.log(`Auth Header : ${authHeader}`);

        if (!authHeader) {
            return responser.error(res, "GLOBAL_E002", 401)
        }
        if (!authHeader.startsWith("Bearer ")) {
            return responser.error(res, "GLOBAL_E002", 401);
        }

        const accessToken = authHeader.split(' ').pop();

        console.log(`Access Token : ${accessToken}`);

        const decoded = verifyToken(accessToken);

        console.log(`Decode : ${decoded.sub}`);

        if (!decoded) {
            return responser.error(res, "GLOBAL_E002", 401);
        } 

        req.userId = decoded.sub;
        return next();
    }catch(error){

        console.log(`Error 1 : ${error}`);

        return responser.error(res, error, 401);
    }
}

module.exports = { validateAccessToken }