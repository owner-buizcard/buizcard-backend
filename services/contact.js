const { default: mongoose } = require("mongoose");
const depManager = require("../core/depManager");
const responser = require("../core/responser");
const { sendEmail } = require("../core/utils");

async function create(req, res) {
    try {
        const { userId } = req;
        const { cardId, ownerId, type } = req.body;

        const existing = await depManager.CONTACT.getContactModel().findOne({ userId, cardId });

        if (existing) return responser.success(res, null, "CONTACT_E001");

        const contact = await depManager.CONTACT.getContactModel().create({ userId, cardId, type, connectedAt: Date.now() });

        sendFollowUp(userId, ownerId);

        return responser.success(res, contact, "CONTACT_S001");
    } catch (error) {
        return responser.error(res, "Error creating contacts", "CONTACT_E001");
    }
}

async function sendFollowUp(userId, ownerId) {
    try{

        const users = await depManager.USER.getUserModel().find({
            _id: { $in: [userId, ownerId] }
          });

        const user = users.find((e)=>e.id==userId);
        const owner = users.find((e)=>e.id==ownerId);

        if(!owner.followUp){
            return;
        }

        sendEmail(
            user.email, 
            `Introducing ${owner.firstName??''} ${owner.lastName??''} - Let's Connect!`, 
            {
                content: `Dear ${user.firstName},

                I hope this email finds you well.
                
                My name is ${owner.firstName??''} ${owner.lastName??''} and I am the ${owner.designation} at ${owner.companyName}. We recently connected through Bizcard and I wanted to take a moment to introduce myself and express my gratitude for connecting.
                
                I believe that there may be opportunities for us to collaborate or support each other in our respective endeavors. Whether it's exploring potential partnerships, sharing insights, or simply exchanging ideas, I am eager to learn more about your work and how we might be able to assist you.
                
                I have attached my contact information below for your reference. Please feel free to reach out at any time to discuss further. Additionally, I would love to hear more about your work and how we might be able to support each other.
                
                Thank you once again for connecting, and I look forward to the possibility of collaborating with you in the future.
                
                Best regards,
                ${owner.firstName??''} ${owner.lastName??''}
                ${owner.designation}
                ${owner.companyName}
                ${owner.phoneNumber}`
            }
        )
    }catch(e){
        console.log(e);
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
        const currentDate = new Date();
        let maxLeads = 3;
        const data = await depManager.SUBSCRIPTION.getSubscriptionModel().findOne({
            userId,
            $expr: {
                $and: [
                    { $lte: [{ $toDate: "$startAt" }, currentDate] },
                    { $gte: [{ $toDate: "$endAt" }, currentDate] }
                ]
            }
        });

        if(data){
            const plan = await depManager.SUBSCRIPTION.getPlanModel().findById(data.plan.id);
            maxLeads = plan.name=='Basic' ? 25: plan.name=='Pro' ? 100: 1000;
        }

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
            },
            {
                $sort: { 
                    'connectedAt': 1
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 }
                }
            }
        ];

        const totalCountPipeline = [...condition];
        const contactsPipeLine = [...condition];
        contactsPipeLine.pop();
        contactsPipeLine.push({ $limit: maxLeads });

        const [totalCountResult, contacts] = await Promise.all([
            depManager.CONTACT.getContactModel().aggregate(totalCountPipeline),
            depManager.CONTACT.getContactModel().aggregate(contactsPipeLine)
        ]);

        const totalCount = totalCountResult && totalCountResult[0] ? totalCountResult[0].total : 0;
        const featureCount = totalCount - contacts.length ;
        
        return responser.success(res, {contacts, totalCount, featureCount}, "CONTACT_S003");
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

async function sendPromotionalMail(req, res){
    try{
        const { emails, subject, content } = req.body;
        const bccRecipients = emails.slice(1);
        await sendEmail(emails[0], subject, {content, bcc: bccRecipients});
        return responser.success(res, true, "CONTACT_S008");
    }catch(error){
        return responser.success(res, null, "GLOBAL_E001");
    }
}

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
    sendPromotionalMail,
    getUserContacts,
    deleteContact,
    updateContact
}