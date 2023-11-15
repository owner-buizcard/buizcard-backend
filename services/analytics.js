const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function update(req, res){
    try{

        const { cardId } = req.query;
        const { type } = req.body;

        const analytics = await depManager.ANALYTICS.getAnalyticsModel().findOne({cardId: cardId});

        if(type=="view"){
            analytics.viewCount += 1;
        }else if(type=="unique"){
            analytics.viewCount += 1;
            analytics.uniqueVisitCount += 1;
        }else if(type=="save"){
            analytics.savedCount += 1;
        }else if(type=="share"){
            analytics.sharedCount += 1;
        }else if(type=="connect"){
            analytics.connectedCount += 1;
        }else if(type=="webclick"){
            analytics.webClickCount += 1;
        }

        await analytics.save();

        return responser.success(res, analytics, "CARD_S001");
    }catch(error){
        console.log(error);
        return responser.success(res, null, "CARD_E001");
    }
}


async function get(req, res){
    try{

        const { cardId } = req.query;

        const analytics = await depManager.ANALYTICS.getAnalyticsModel().findOne({cardId: cardId});

        return responser.success(res, analytics, "CARD_S001");
    }catch(error){
        console.log(error);
        return responser.success(res, null, "CARD_E001");
    }
}

module.exports = {
    get,
    update
}