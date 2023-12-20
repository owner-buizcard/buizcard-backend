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

        if (type !== "view") {
            switch (type) {
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

            await depManager.CARD_LOG.getCardLogModel().create(data);
        } else {
            analytics.viewCount += 1;
        }

        await analytics.save();

        return responser.success(res, "CONTACT_S001");
    } catch (error) {
        console.error(error);
        return responser.error(res, "CONTACT_E001", "Error adding card log");
    }
}

async function getCardLog(req, res) {
    try {
        const { cardId, count } = req.query;

        const logs = await depManager.CARD_LOG.getCardLogModel()
            .find({ cardId })
            .sort({ created: -1 })
            .limit(parseInt(count, 10) || 10);

        return responser.success(res, logs, "CONTACT_S001");
    } catch (error) {
        console.error(error);
        return responser.error(res, "CONTACT_E001", "Error fetching card logs");
    }
}

module.exports = {
    addCardLog,
    getCardLog
};
