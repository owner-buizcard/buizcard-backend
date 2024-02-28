
const { default: mongoose } = require("mongoose");
const depManager = require("../core/depManager");
const responser = require("../core/responser");
const { generateTokens } = require("./token");

async function fetchConfigData(req, res) {
    try{

        const [fieldTypes, configs] = await Promise.all([
            depManager.CONFIG.getFieldTypesModel().find(),
            depManager.CONFIG.getConfigModel().find()
        ]);

        const config = {fieldTypes, configs};
        
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
                $unwind: {
                    path: '$card',
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $addFields: {
                    card: {
                        $ifNull: ['$card', null] 
                    }
                }
            }
        ];
        

        const [user, cards, contacts, fieldTypes, configs, plans, subscriptions] = await Promise.all([
            depManager.USER.getUserModel().findById(userId),
            depManager.CARD.getCardModel().aggregate(conditionForCards),
            depManager.CONTACT.getContactModel().aggregate(condition),
            depManager.CONFIG.getFieldTypesModel().find(),
            depManager.CONFIG.getConfigModel().find(),
            depManager.SUBSCRIPTION.getPlanModel().find(),
            depManager.SUBSCRIPTION.getSubscriptionModel().find({userId}),
        ]);

        const currentDate = new Date();

        const subscriptionMap = {
            current: [],
            upcoming: [],
            expired: []
        };

        subscriptions.forEach(subscription => {
            const planData = plans.find((plan )=>{
                return new mongoose.Types.ObjectId(subscription.plan.id).equals(plan._id)
            });
            const duration = subscription.plan.type=="m" ? "1 Month" : "1 Year";
            const endDate = subscription.endAt;
            const mappedSubscription = {
                planId: subscription.plan.id,
                subscriptionId: subscription._id,
                name: planData.name,
                startAt: subscription.startAt,
                endAt: endDate,
                duration: duration,
                type: subscription.plan.type
            };

            if (subscription.startAt <= currentDate && endDate >= currentDate) {
                subscriptionMap.current.push(mappedSubscription);
            } else if (endDate < currentDate) {
                subscriptionMap.expired.push(mappedSubscription);
            } else if (subscription.startAt > currentDate) {
                subscriptionMap.upcoming.push(mappedSubscription);
            }
        });
        
        const token = generateTokens(userId)
        const config = {fieldTypes, configs, plans};
        
        return responser.success(res, {user, contacts, cards, config,  token, subscriptionMap}, "MAIN_S001")
    }catch(error){
        console.log(error);
        return responser.success(res, null, "MAIN_E001")
    }
}

module.exports = {
    fetchConfigData,
    fetchMainData
}