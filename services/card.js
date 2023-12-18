const depManager = require("../core/depManager");
const responser = require("../core/responser");
const path = require('path');
const { generatePreviewImage, uploadFile } = require("../core/utils");

async function create(req, res){
    try{
        
        // const fileUrl = await generatePreviewImage("1");

        // console.log(req.file);

        // console.log(req.files);

        const picture = req.files?.picture;
        const uploaded = await uploadFile(`card`, picture)
        return responser.success(res, uploaded, "CARD_S001");


        // const logo = req.files?.logo;
        // const banner = req.files?.banner;

        // if(picture){
        //     // const uploadPath = path.join(__dirname, 'uploads/', picture.name);
        //     // await picture.mv(uploadPath);

        //     data.picture = await uploadFile(`card/${userId}`, picture)
        // }
        // if(logo){
        //     data.logo = await uploadFile(`card/${userId}`, logo)
        // }
        // if(banner){
        //     data.banner = await uploadFile(`card/${userId}`, banner)
        // }

        //////////////////////////////////////////////////////////////////////////////////////////

        // const userId = req.userId;
        // let data = req.body;
        
        // data.created = Date.now();
        // data.createdBy = userId;

        // const card = await depManager.CARD.getCardModel().create(data);

        // await depManager.ANALYTICS.getAnalyticsModel().create({cardId: card._id});

        // return responser.success(res, card, "CARD_S001");
    }catch(error){
        console.log(error);
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