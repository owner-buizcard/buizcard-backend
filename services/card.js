const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function create(req, res){
    try{
        const userId = req.userId;
        let data = req.body;

        const {picture, logo, banner} = req.files;

        if(picture!=null){
            data.picture = await uploadFile(`picture/${userId}/`, picture)
        }

        if(logo!=null){
            data.logo = await uploadFile(`logo/${userId}/`, logo)
        }

        if(banner!=null){
            data.banner = await uploadFile(`banner/${userId}/`, banner)
        }
        
        data.created = Date.now();
        data.createdBy = userId;

        const card = await depManager.CARD.getCardModel().create(data);
        return responser.success(res, card, "CARD_S001");
    }catch(error){
        console.log(error);
        return responser.success(res, null, "CARD_E001");
    }
}

async function update(req, res){
    try{
        const { cardId } = req.query;
        const data = req.body;

        data.updated = Date.now();

        const card = await depManager.CARD.getCardModel().updateOne({_id: cardId}, data);

        return responser.success(res, card, "CARD_S002");
    }catch(error){
        return responser.success(res, null, "CARD_E001");
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

        await depManager.CARD.getCardModel().updateOne({_id: cardId}, {status: "DELETED"});

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