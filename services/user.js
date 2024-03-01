const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function deleteAccount(req, res){
    try{
        const userId = req.userId;
        await depManager.USER.getUserModel().deleteOne({_id: userId});

        return responser.success(res, true, "USER_S002");
    }catch(error){
        return responser.success(res, null, "USER_E001");
    }
}

async function updateFollowUp(req, res){
    try{
        const userId = req.userId;
        const {value} = req.query;
        await depManager.USER.getUserModel().updateOne({_id: userId}, {followUp: value});
        return responser.success(res, true, "USER_S003");
    }catch(e){
        console.log(error);
        return responser.success(res, null, "USER_E001");
    }
}

async function updateBranding(req, res){
    try{
        const userId = req.userId;
        const {value} = req.query;
        await depManager.USER.getUserModel().updateOne({_id: userId}, {branding: value});
        return responser.success(res, true, "USER_S003");
    }catch(e){
        console.log(error);
        return responser.success(res, null, "USER_E001");
    }
}

async function update(req, res){
    try{

        const userId = req.userId;

        const user = await depManager.USER.getUserModel().findById(userId);

        if(!user){
            return responser.success(res, null, "USER_E002");
        }

        const {firstName, designation, additionalEmail, additionalPhoneNumber, whatsappNumber, enableWhatsapp, companyName, companyWebsite, gender, dateOfBirth, address, lastName, picture, locale, countryCode, dateFormat, defaultCurrency, phoneNumber} = req.body;

        if(firstName){
            user.firstName = firstName;
        }
        if(enableWhatsapp){
            user.enableWhatsapp = enableWhatsapp;
        }
        if(lastName){
            user.lastName = lastName;
        }
        if(picture){
            user.picture = picture;
        }
        if(designation){
            user.designation = designation;
        }
        if(additionalEmail){
            user.additionalEmail = additionalEmail;
        }
        if(additionalPhoneNumber){
            user.additionalPhoneNumber = additionalPhoneNumber;
        }
        if(whatsappNumber){
            user.whatsappNumber = whatsappNumber;
        }
        if(companyName){
            user.companyName = companyName;
        }
        if(companyWebsite){
            user.companyWebsite = companyWebsite;
        }
        if(gender){
            user.gender = gender;
        }
        if(dateOfBirth){
            user.dateOfBirth = dateOfBirth;
        }
        if(address){
            user.address = address;
        }
        if(locale){
            user.locale = locale;
        }
        if(countryCode){
            user.countryCode = countryCode;
        }
        if(dateFormat){
            user.dateFormat = dateFormat;
        }  
        if(defaultCurrency){
            user.defaultCurrency = defaultCurrency;
        }  
        if(phoneNumber){
            user.phoneNumber = phoneNumber;
        }        
        user.updated = Date.now();
        await user.save();

        return responser.success(res, user, "USER_S001");

    }catch(error){
        console.log(error);
        return responser.success(res, null, "USER_E001");
    }
}

module.exports = {
    update,
    deleteAccount,
    updateFollowUp,
    updateBranding
}