const depManager = require("../core/depManager");
const responser = require("../core/responser");

async function update(req, res){
    try{

        const userId = req.userId;

        const user = await depManager.USER.getUserModel().findById(userId);

        if(!user){
            return responser.success(res, null, "USER_E002");
        }

        const {firstName, lastName, picture, locale, countryCode, dateFormat, defaultCurrency, phoneNumber} = req.body;

        if(firstName){
            user.firstName = firstName;
        }
        if(lastName){
            user.lastName = lastName;
        }
        if(picture){
            user.picture = picture;
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
        user.updated = new Date.now();
        await user.save();

        return responser.success(res, user, "USER_S001");

    }catch(error){
        return responser.success(res, null, "USER_E001");
    }
}

module.exports = {
    update
}