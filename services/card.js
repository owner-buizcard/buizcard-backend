const depManager = require("../core/depManager");
const responser = require("../core/responser");
const { generatePreviewImage, uploadFile } = require("../core/utils");

async function create(req, res) {
    try {
        const { userId, body, files } = req;
        const fileKeys = ['picture', 'logo', 'banner', 'qrLogo'];

        const uploadFilePromises = fileKeys.map(async (fileKey) => {
            const file = files[fileKey];
            if (file) {
                if (fileKey.startsWith("qr")) {
                    body['qr'] = { ...body['qr'], ['logo']: await uploadFile(`card/${userId}/${fileKey}`, file) };
                } else {
                    body[fileKey] = await uploadFile(`card/${userId}/${fileKey}`, file);
                }
            }
        });

        await Promise.all(uploadFilePromises);

        const data = {
            ...body,
            created: Date.now(),
            createdBy: userId,
        };

        const card = await depManager.CARD.getCardModel().create(data);
        await depManager.ANALYTICS.getAnalyticsModel().create({ cardId: card._id });

        const cardLink = `${process.env.ORIGIN}/app/p?cardId=${card._id}`;
        const previewImage = await generatePreviewImage(card);

        card.cardLink = cardLink;
        card.linkPreviewImage = previewImage;
        
        await card.save();

        return responser.success(res, card, "CARD_S001");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "CARD_E001");
    }
}



async function update(req, res){
    try{
        const { cardId } = req.query;
        const data = req.body;

        delete data?.deleted;
        delete data?.updated;
        delete data?.created;
        delete data?.createdBy;

        data.updated = Date.now();

        const card = await depManager.CARD.getCardModel().findByIdAndUpdate(cardId, data, { new: true });

        return responser.success(res, card, "CARD_S002");
    }catch(error){
        return responser.success(res, error, "CARD_E001");
    }
}

async function get(req, res){
    try{
        const { cardId } = req.query;
        const card = await depManager.CARD.getCardModel().findById(cardId);

        return responser.success(res, card, "CARD_S003");
    }catch(error){
        return responser.success(res, null, "CARD_E001");
    }
}

async function getUserCards(req, res){
    try{
        const userId = req.userId;
        const cards = await depManager.CARD.getCardModel().find({createdBy: userId, status: { $ne: "DELETED" }});

        return responser.success(res, cards, "CARD_S004");
    }catch(error){
        return responser.success(res, null, "CARD_E001");
    }
}

async function deleteCard(req, res){
    try{
        const { cardId } = req.query;

        await Promise.all([
            depManager.CARD.getCardModel().updateOne({_id: cardId}, {status: "DELETED"}),
            depManager.ANALYTICS.getAnalyticsModel().deleteOne({cardId: cardId})
        ])

        return responser.success(res, true, "CARD_E005");
    }catch(error){
        return responser.success(res, null, "CARD_E001");
    }
}

module.exports = {
    create,
    update,
    get,
    getUserCards,
    deleteCard
}