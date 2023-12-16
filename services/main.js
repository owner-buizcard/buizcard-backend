
const { default: mongoose } = require("mongoose");
const depManager = require("../core/depManager");
const responser = require("../core/responser");
const { generateTokens } = require("./token");

async function fetchConfigData(req, res) {
    try{

        const [fieldTypes] = await Promise.all([
            depManager.CONFIG.getFieldTypesModel().find()
        ]);

        const config = {fieldTypes};
        
        return responser.success(res, {config}, "MAIN_S001")
    }catch(error){
        console.log(error);
        return responser.success(res, null, "MAIN_E001")
    }
}

async function fetchMainData(req, res) {
    try{
        const userId = req.userId;

        const conditionForCards = [
            {
                $match: {
                  createdBy: new mongoose.Types.ObjectId(userId),
                  status: { $ne: "DELETED" }
                }
            },
            {
              $lookup: {
                from: "Analytics",
                localField: "_id",
                foreignField: "cardId",
                as: "analytics"
              }
            },
            {
              $unwind: {
                path: "$analytics",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $group: {
                _id: "$_id",
                cardData: { $first: "$$ROOT" },
                analytics: { $push: "$analytics" }
              }
            },
            {
                $project: {
                    cardData: {
                    $mergeObjects: ["$cardData", { analytics: "$analytics" }]
                    }
                }
            },
            {
              $replaceRoot: {
                newRoot: "$cardData"
              }
            }
        ];   

        const condition = [
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'Cards',
                    localField: 'cardId',
                    foreignField: '_id',
                    as: 'card'
                }
            },
            {
                $unwind: '$card'
            }
        ];

        const [user, cards, contacts, fieldTypes, backgrounds] = await Promise.all([
            depManager.USER.getUserModel().findById(userId),
            depManager.CARD.getCardModel().aggregate(conditionForCards),
            depManager.CONTACT.getContactModel().aggregate(condition),
            depManager.CONFIG.getFieldTypesModel().find(),
            depManager.CONFIG.getBackgroundModel().find()
        ]);
        
        const token = generateTokens(userId)
        const config = {fieldTypes, backgrounds};
        
        return responser.success(res, {user, contacts, cards, config,  token}, "MAIN_S001")
    }catch(error){
        console.log(error);
        return responser.success(res, null, "MAIN_E001")
    }
}

module.exports = {
    fetchConfigData,
    fetchMainData
}