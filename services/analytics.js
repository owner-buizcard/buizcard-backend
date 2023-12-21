const depManager = require("../core/depManager");
const responser = require("../core/responser");
const {ObjectId} = require('mongodb');

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

        return responser.success(res, { totals, sortedCardIds }, "ANALYTICS_S001");
    } catch (error) {
        console.error(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}


async function getCardAnalytics(req, res){
    try{
        const { cardId } = req.query;
        let analytics = await depManager.ANALYTICS.getAnalyticsModel().findOne({cardId: cardId});

        analytics = analytics.toJSON();

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weekLogViews = await depManager.CARD_LOG.getCardLogModel().aggregate([
            {
              $match: {
                cardId: new ObjectId(cardId),
                'action.type': 'view',
                created: { $gte: weekAgo }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$created' },
                  month: { $month: '$created' },
                  day: { $dayOfMonth: '$created' }
                },
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                date: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: {
                      $dateFromParts: {
                        year: '$_id.year',
                        month: '$_id.month',
                        day: '$_id.day'
                      }
                    }
                  }
                },
                count: 1
              }
            },
            {
              $sort: { date: 1 }
            }
          ]);

        analytics.weekLogViews = weekLogViews;

        return responser.success(res, analytics, "ANALYTICS_S002");
    }catch(error){
        console.log(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    getCardAnalytics,
    getUserAnalytics
}