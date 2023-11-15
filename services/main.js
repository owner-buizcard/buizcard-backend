
const { default: mongoose } = require("mongoose");
const depManager = require("../core/depManager");
const responser = require("../core/responser");
const { generateTokens } = require("./token");

async function fetchMainData(req, res) {
    try{
        const userId = req.userId;

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

        const [user, cards, contacts, fieldTypes] = await Promise.all([
            depManager.USER.getUserModel().findById(userId),
            depManager.CARD.getCardModel().find({createdBy: userId, status: { $ne: "DELETED" }}),
            depManager.CONTACT.getContactModel().aggregate(condition),
            depManager.CONFIG.getFieldTypesModel().find()
        ]);
        
        const token = generateTokens(userId)
        const config = {fieldTypes};
        
        return responser.success(res, {user, contacts, cards, config,  token}, "MAIN_S001")
    }catch(error){
        console.log(error);
        return responser.success(res, null, "MAIN_E001")
    }
}

module.exports = {
    fetchMainData
}