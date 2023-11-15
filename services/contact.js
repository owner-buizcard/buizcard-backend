const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function create(req, res) {
    try {
        const { userId } = req;
        const { cardId, friendId, myCardId } = req.body;

        const checkContactExists = async (userId, cardId) => {
            return depManager.CONTACT.getContactModel().findOne({ userId, cardId });
        };

        const [existingMyContact, existingFriendContact] = await Promise.all([
            checkContactExists(userId, cardId),
            checkContactExists(friendId, myCardId)
        ]);

        if (existingMyContact || existingFriendContact) {
            return responser.success(res, null, "CONTACT_E002");
        }

        const createContact = async (data) => {
            return depManager.CONTACT.getContactModel().create(data);
        };

        const myData = { userId, cardId, connectedAt: Date.now() };
        const friendData = { userId: friendId, cardId: myCardId, status: "request", connectedAt: Date.now() };

        const [myContact] = await Promise.all([
            createContact(myData),
            createContact(friendData)
        ]);

        return responser.success(res, { myContact }, "CONTACT_S001");
    } catch (error) {
        return responser.error(res, "Error creating contacts", "CONTACT_E001");
    }
}

async function get(req, res){
    try{
        const contactId = req.query.contactId
        const contact = await depManager.CONTACT.getContactModel().findById(contactId);
        
        return responser.success(res, contact, "CONTACT_S001");
    }catch(error){
        return responser.success(res, null, "CONTACT_E001");
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
        
        return responser.success(res, contacts, "CONTACT_S001");
    }catch(error){
        return responser.success(res, null, "CONTACT_E001");
    }
}

async function deleteContact(req, res){
    try{
        const userId = req.userId;
        const contactId = req.query.contactId
        await depManager.CONTACT.getContactModel().deleteOne({userId: userId, contactId: contactId});

        return responser.success(res, true, "CONTACT_S001");
    }catch(error){
        return responser.success(res, null, "CONTACT_E001");
    }
}

module.exports = {
    create,
    get,
    getUserContacts,
    deleteContact
}