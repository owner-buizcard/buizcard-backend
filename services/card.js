const depManager = require("../core/depManager");
const responser = require("../core/responser");
const { generatePreviewImage, uploadFile } = require("../core/utils");

async function create(req, res) {
    try {
        const userId = req.userId;
        const { cardName, isPublic } = req.body;

        const data = {
            cardName,
            isPublic,
            created: Date.now(),
            createdBy: userId,
        };

        const card = await depManager.CARD.getCardModel().create(data);

        const cardLink = `${process.env.ORIGIN}/app/p/${card._id}`;
        card.cardLink = cardLink;

        await Promise.all([
            card.save(),
            depManager.ANALYTICS.getAnalyticsModel().create({ cardId: card._id }),
        ]);

        return responser.success(res, card, "CARD_S001");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}

async function uploadCardImage(req, res) {
    try{
        const userId = req.userId;
        const { file } = req.files;
        const { cardId, key } = req.body;

        const fileUrl = await uploadFile(`${userId}/card/${cardId}`, file, key);

        return responser.success(res, fileUrl, "CARD_S006");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}

async function update(req, res) {
    try {
        const { body, query } = req;
        const { cardId } = query;

        const card = await depManager.CARD.getCardModel().findById(cardId);

        const updateFields = [
            "cardName",
            "bio",
            "name",
            "phoneNumber",
            "email",
            "address",
            "company",
            "picture",
            "logo",
            "banner",
            "fields",
            "qr",
            "qrVisible",
            "qrWithLogo",
        ];

        updateFields.forEach((field) => {
            if (body[field]) card[field] = body[field];
        });

        try {
            card.linkPreviewImage = await generatePreviewImage(card);
        } catch (e) {}

        await card.save();

        return responser.success(res, card, "CARD_S002");
    } catch (error) {
        return responser.success(res, error, "GLOBAL_E001");
    }
}

async function get(req, res) {
    try {
        const { cardId } = req.query;
        const card = await depManager.CARD.getCardModel().findById(cardId);

        return responser.success(res, card, "CARD_S003");
    } catch (error) {
        return responser.success(res, null, "GLOBAL_E001");
    }
}

async function getUserCards(req, res) {
    try {
        const userId = req.userId;
        const cards = await depManager.CARD.getCardModel().find({
            createdBy: userId,
            status: { $ne: "DELETED" },
        });

        return responser.success(res, cards, "CARD_S004");
    } catch (error) {
        return responser.success(res, null, "GLOBAL_E001");
    }
}

async function deleteCard(req, res) {
    try {
        const { cardId } = req.query;

        await Promise.all([
            depManager.CARD.getCardModel().updateOne({ _id: cardId }, { status: "DELETED" }),
            depManager.ANALYTICS.getAnalyticsModel().deleteOne({ cardId: cardId }),
        ]);

        return responser.success(res, true, "CARD_E005");
    } catch (error) {
        return responser.success(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    create,
    uploadCardImage,
    update,
    get,
    getUserCards,
    deleteCard,
};
