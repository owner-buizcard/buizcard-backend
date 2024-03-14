const path = require("path");
const responser = require("../core/responser");
const fs = require('fs');
const { generateQrImage } = require("../core/utils");

async function generateSignature(req, res) {
    try {

        const { fullName, jobTitle, company, phoneNumber, location, disclaimer, showQrCode, cardId } = req.body;

        let qrImageUrl = null;
        
        if(showQrCode){
            qrImageUrl = await generateQrImage(cardId);
        }

        const rootPath = process.cwd();
        const templatePath = path.join(rootPath,'templates', 'email_signature_template.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const signature = htmlTemplate
            .replace('[fullName]', `${fullName}`)
            .replace('[jobTitle]', jobTitle)
            .replace('[company]', company)
            .replace('[phoneNumber]', phoneNumber)
            .replace('[location]', location)
            .replace('[disclaimer]', disclaimer)
            .replace('[qrImage]', qrImageUrl ? `<img src="${qrImageUrl}" alt="QR Code" width="100px">` : '');

        return responser.success(res, `${signature}`, "SIGNATURE_S001");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    generateSignature
};