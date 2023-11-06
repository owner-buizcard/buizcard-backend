const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function create(req, res){
    try{
        const userId = req.userId;
        const {contactId} = req.body;

        const data = {
            userId: userId,
            contactId: contactId,
            connectedAt: new Date.now()
        }

        const contact = await depManager.CONTACT.getContactModel().create(data);
        
        return responser.success(res, contact, "CONTACT_S001");
    }catch(error){
        return responser.success(res, null, "CONTACT_E001");
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
        const contacts = await depManager.CONTACT.getContactModel().find({userId: userId});
        
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