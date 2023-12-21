const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function addCardLog(req, res) {
    try {
        const { cardId, by, type } = req.body;

        let user = by ?? 'Someone';
        let prompt = '';

        if (by) {
            const userInfo = await depManager.USER.getUserModel().findById(by);
            user = `${userInfo.firstName} ${userInfo.lastName}`;
        }

        const analytics = await depManager.ANALYTICS.getAnalyticsModel().findOne({ cardId: cardId });

        switch (type) {
            case "view":
                analytics.viewCount += 1;
                prompt = `${user} viewed your card`;
                break;
            case "unique-visit":
                analytics.viewCount += 1;
                analytics.uniqueVisitCount += 1;
                prompt = `${user} viewed your card`;
                break;
            case "webclick":
                analytics.webClickCount += 1;
                prompt = `${user} opened your web link`;
                break;
            case "save":
                analytics.savedCount += 1;
                prompt = `${user} saved your card`;
                break;
            case "share":
                analytics.sharedCount += 1;
                prompt = `${user} shared your card`;
                break;
            case "connect":
                analytics.connectedCount += 1;
                prompt = `${user} connected your card`;
                break;
        }

        const data = {
            cardId,
            by,
            action: {
                type,
                prompt,
            },
            created: Date.now()
        };

        await Promise.all([
            depManager.CARD_LOG.getCardLogModel().create(data),
            analytics.save()
        ])

        return responser.success(res, true, "CARDLOG_S001");
    } catch (error) {
        console.error(error);
        return responser.error(res, null, "GLOBAL_E001");
    }
}

async function getCardLog(req, res) {
    try {
        const { cardId, count } = req.query;

        const logs = await depManager.CARD_LOG.getCardLogModel()
            .find({ cardId })
            .sort({ created: -1 })
            .limit(parseInt(count, 10) || 10);

        return responser.success(res, logs, "CARDLOG_S002");
    } catch (error) {
        console.error(error);
        return responser.error(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    addCardLog,
    getCardLog
};
