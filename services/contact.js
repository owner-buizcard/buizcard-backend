const { default: mongoose } = require("mongoose");
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

async function createDetails(req, res) {
    try {
        const { userId } = req;
        const details = req.body;

        const contact = await depManager.CONTACT.getContactModel().create({ 
            userId, 
            details, 
            type: "PaperCard", 
            connectedAt: Date.now()
        });

        return responser.success(res, contact, "CONTACT_S006");
    } catch (error) {
        console.log(error);
        return responser.error(res, "Error creating contacts", "CONTACT_E001");
    }
}

async function connectForm(req, res) {
    try {
        const { name, email, phone, title, company, message, userId, connectedBy } = req.body;
        const details = { name, email, phone, title, company, message };

        const contact = await depManager.CONTACT.getContactModel().create({ 
            userId, 
            details, 
            connectedBy,
            type: "Message", 
            status: "request",
            connectedAt: Date.now()
        });

        return responser.success(res, contact, "CONTACT_S006");
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

        const contacts = await depManager.CONTACT.getContactModel().aggregate(condition);
        
        return responser.success(res, contacts, "CONTACT_S003");
    }catch(error){
        console.log(error);
        return responser.success(res, null, "GLOBAL_E001");
    }
}

async function deleteContact(req, res){
    try{
        const contactId = req.query.contactId
        await depManager.CONTACT.getContactModel().deleteOne({_id: contactId});

        return responser.success(res, true, "CONTACT_S005");
    }catch(error){
        return responser.success(res, null, "GLOBAL_E001");
    }
}

// async function addTags(req, res){
//     try{
//         const contactId = req.query.contactId
//         const { tags } = req.body;
//         const updated = await depManager.CONTACT.getContactModel().findOneAndUpdate({_id: contactId}, {tags: tags}, { new: true });
//         return responser.success(res, updated, "CONTACT_S007");
//     }catch(error){
//         return responser.success(res, null, "GLOBAL_E001");
//     }
// }

async function updateContact(req, res){
    try{
        const contactId = req.query.contactId
        const data = req.body;
        const updated = await depManager.CONTACT.getContactModel().findOneAndUpdate({_id: contactId}, data, { new: true });
        return responser.success(res, updated, "CONTACT_S007");
    }catch(error){
        return responser.success(res, null, "GLOBAL_E001");
    }
}

module.exports = {
    create,
    createDetails,
    createRequest,
    connectForm,
    get,
    getUserContacts,
    deleteContact,
    updateContact
}