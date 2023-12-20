const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function getUserAnalytics(req, res) {
    try {
        const { userId } = req.query;

        const cardIds = await depManager.CARD.getCardModel().find({
            createdBy: userId,
            status: { $ne: "DELETED" },
        }).select('_id');

        const analyticsPromises = cardIds.map(async (id) => {
            const cardAnalytics = await depManager.ANALYTICS.getAnalyticsModel().findOne({ cardId: id });
            return { cardId: id, analytics: cardAnalytics || { viewCount: 0, uniqueVisitCount: 0, savedCount: 0, sharedCount: 0, connectedCount: 0, webClickCount: 0 } };
        });

        const analyticsResults = await Promise.all(analyticsPromises);

        analyticsResults.sort((a, b) => b.analytics.viewCount - a.analytics.viewCount);

        const sortedCardIds = analyticsResults.map(item => item.cardId);

        const totals = analyticsResults.reduce((acc, item) => {
            const analytics = item.analytics;
            acc.totalViewCount += analytics.viewCount;
            acc.totalUniqueVisitCount += analytics.uniqueVisitCount;
            acc.totalSavedCount += analytics.savedCount;
            acc.totalSharedCount += analytics.sharedCount;
            acc.totalConnectedCount += analytics.connectedCount;
            acc.totalWebClickCount += analytics.webClickCount;
            return acc;
        }, {
            totalViewCount: 0,
            totalUniqueVisitCount: 0,
            totalSavedCount: 0,
            totalSharedCount: 0,
            totalConnectedCount: 0,
            totalWebClickCount: 0,
        });

        return responser.success(res, { totals, sortedCardIds }, "CARD_S001");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "CARD_E001");
    }
}


async function getCardAnalytics(req, res){
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
    getCardAnalytics,
    getUserAnalytics
}