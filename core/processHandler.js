const coreDB = require("./db");
const responser = require("./responser");

module.exports = function (service) {
    return async function (req, res, next) {
        const db = await coreDB.openDBConnection();
        try {
            await service(req, res, next);
        } catch (error) {
            console.log(error);
            responser.error(res, error);
        } finally {
            await coreDB.closeDBConnnection(db);
        }
    };
};

