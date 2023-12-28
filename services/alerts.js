const responser = require("../core/responser");
const { sendWhatsappMessage } = require("../core/utils");

async function sendWhatsappAlert(req, res) {
    try {
        await sendWhatsappMessage();
        return responser.success(res, true, "ALERTS_S001");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    sendWhatsappAlert
}