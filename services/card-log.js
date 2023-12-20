const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function addCardLog(req, res){
    try{
        const { cardId, by, type } = req.body;

        let prompt = '';
        let user = by ?? 'Someone';

        if(by){
            const userInfo = await depManager.USER.getUserModel().findById(by);
            user = `${userInfo.firstName} ${userInfo.lastName}`;
        }

        if(type=='unique-visit'){
            prompt = `${user} viewed your card`;
        }else if(type=='webclick'){
            prompt = `${user} opened your web link`;
        }else if(type=='save'){
            prompt = `${user} saved your card`;
        }else if(type=='share'){
            prompt = `${user} shared your card`;
        }else if(type=='connect'){
            prompt = `${user} connected your card`;
        }

        const data = {
            cardId,
            by,
            action: {
                type,
                prompt,
            },
            created: Date.now()
        }

        await depManager.CARD_LOG.getCardLogModel().create(data);
        
        return responser.success(res, contact, "CONTACT_S001");
    }catch(error){
        return responser.success(res, null, "CONTACT_E001");
    }
}


async function getCardLog(req, res){

    const { cardId, count } = req.query;

    try{
        const logs = await depManager.CARD_LOG.getCardLogModel()
            .find({cardId})
            .sort({ created: -1 })
            .limit(parseInt(count, 10) || 10);

        return responser.success(res, logs, "CONTACT_S001");
    }catch(error){
        return responser.success(res, null, "CONTACT_E001");
    }
}

module.exports = {
    addCardLog,
    getCardLog
}