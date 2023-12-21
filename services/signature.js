const responser = require("../core/responser");
const { generateQrImage } = require("../core/utils");

async function generateSignature(req, res) {
    try {

        const { fullName, jobTitle, company, phoneNumber, location, disclaimer, showQrCode, cardId } = req.body;

        let qrImageUrl = null;
        
        if(showQrCode){
            qrImageUrl = await generateQrImage(cardId);
        }

        const signature = `
            <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
                <p>${fullName}</p>
                <p>${jobTitle}</p>
                <p>${company}</p>
                <p>${phoneNumber}</p>
                <p>${location}</p>
                <p>${disclaimer}</p>
                ${qrImageUrl ? `<img src="${qrImageUrl}" alt="QR Code">` : ''}
            </div>
        `;

        return responser.success(res, signature, "SIGNATURE_S001");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    generateSignature
};