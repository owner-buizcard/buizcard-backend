const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function create(req, res) {
    try {
        const { userId } = req;
        const { cardId, type } = req.body;

        const existing = await depManager.CONTACT.getContactModel().findOne({ userId, cardId });

        if (existing) return responser.success(res, null, "CONTACT_E001");

        const contact = await depManager.CONTACT.getContactModel().create({ userId, cardId, type, connectedAt: Date.now() });

        return responser.success(res, contact, "CONTACT_S001");
    } catch (error) {
        return responser.error(res, "Error creating contacts", "CONTACT_E001");
    }
}

async function createRequest(req, res) {
    try {
        const { cardId, type, connectedBy, userId } = req.body;

        const existing = await depManager.CONTACT.getContactModel().findOne({ userId, cardId });

        if (existing) return responser.success(res, null, "CONTACT_E001");

        const contact = await depManager.CONTACT.getContactModel().create({ 
            userId, 
            cardId, 
            type, 
            connectedBy, 
            connectedAt: Date.now(),
            status: "request" 
        });

        return responser.success(res, contact, "CONTACT_S002");
    } catch (error) {
        return responser.error(res, "Error creating contacts", "GLOBAL_E001");
    }
}


async function get(req, res){
    try{
        const contactId = req.query.contactId
        const contact = await depManager.CONTACT.getContactModel().findById(contactId);
        
        return responser.success(res, contact, "CONTACT_S004");
    }catch(error){
        return responser.success(res, null, "GLOBAL_E001");
    }
}

async function getUserContacts(req, res){
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

        const contacts = await depManager.CONTACT.getContactModel().aggregate(condition);
        
        return responser.success(res, contacts, "CONTACT_S003");
    }catch(error){
        return responser.success(res, null, "GLOBAL_E001");
    }
}

async function deleteContact(req, res){
    try{
        const userId = req.userId;
        const contactId = req.query.contactId
        await depManager.CONTACT.getContactModel().deleteOne({userId: userId, contactId: contactId});

        return responser.success(res, true, "CONTACT_S005");
    }catch(error){
        return responser.success(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    create,
    createRequest,
    get,
    getUserContacts,
    deleteContact
}