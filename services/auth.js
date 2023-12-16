const bcrypt = require('bcryptjs');
const depManager = require("../core/depManager");
const { generateTokens } = require("./token");
const responser = require("../core/responser");
const { default: axios } = require('axios');

async function githubAuth(req, res, next){
    const passport = req.passport;
    passport.authenticate('github')(req, res, next);
}

async function googleAuth(req, res, next){
    const passport = req.passport;
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
}

async function linkedinAuth(req, res){
    try{
        const { code } = req.query;

        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("client_id", "864hy6jn3uyw75");
        params.append("client_secret", "ShBuFryvw8eV58zu");
        params.append("redirect_uri", "https://x9a0br47t1.execute-api.us-east-1.amazonaws.com/dev/auth/linkedin/callback");
        
        const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        const access_token = response?.data?.access_token;

        const linkedinData = await axios.get("https://api.linkedin.com/v2/userinfo", {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })

        let oldUser = await depManager.USER.getUserModel().findOne({email: linkedinData?.email});
        
        let accessToken;
        
        if(oldUser!=null){

            oldUser.lastLogin = Date.now();
            await oldUser.save();

            accessToken = generateTokens(oldUser._id).accessToken;

        }else{
            const data = {
                firstName: linkedinData?.given_name,
                lastName: linkedinData?.family_name,
                displayName: linkedinData.name,
                picture: linkedinData?.picture,
                email: linkedinData?.email,
                emailVerified: linkedinData?.email_verified, 
                locale: linkedinData?.locale?.language,
                provider: "linkedin",
                created: Date.now(),
                lastLogin: Date.now(),
                registrationStatus: 'registered'
            };

            const createdUser = await depManager.USER.getUserModel().create(data);

            accessToken = generateTokens(createdUser._id).accessToken;
        }

        res.redirect(`https://bizcard-spiderlingz.web.app/auth/callback?token=${accessToken}`);
    }catch(error){
        return responser.error(res, error, "GLOBAL_E001");
    }
}

async function authCallback(req, res){

    const user = req.user;

    let oldUser = await depManager.USER.getUserModel().findOne({provider: user.provider, providerId: user.providerId});
    
    let accessToken;
    
    if(oldUser!=null){

        oldUser.lastLogin = Date.now();
        await oldUser.save();

        accessToken = generateTokens(oldUser._id).accessToken;

    }else{
        const data = {
            firstName: user.given_name,
            lastName: user.family_name,
            picture: user.picture,
            customPicture: true,
            email: user.email,
            emailVerified: user.email_verified,
            locale: user.locale,
            provider: user.provider,
            providerId: user.id,
            created: Date.now(),
            registrationStatus: 'registered'
        }

        const createdUser = await depManager.USER.getUserModel().create(data);
        accessToken = generateTokens(createdUser._id).accessToken;
    }

    res.redirect(`https://bizcard-spiderlingz.web.app/auth/callback?token=${accessToken}`);
}

async function signupWithEmail(req, res){
    try{
        const {email, password, firstName, lastName} = req.body;
        const UserModel = depManager.USER.getUserModel();

        const user = await UserModel.findOne({email: email});

        if(user){
            return responser.success(res, null, "AUTH_E002");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            provider: "EMAIL",
            providerId: email,
            registrationStatus: "registered"
        };

        const createdUser = await UserModel.create(data);
        const token = generateTokens(createdUser._id);

        return responser.success(res, {createdUser, token}, "AUTH_S002");
        
    }catch(error){
        return responser.success(res, null, "AUTH_E001");
    }
}


async function loginWithEmail(req, res){
    try{
        const {email, password} = req.body;
        const UserModel = depManager.USER.getUserModel();

        const user = await UserModel.findOne({email: email});

        if(!user){
            return responser.success(res, null, "AUTH_E003");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(passwordMatch){
            const token = generateTokens(user._id);
            return responser.success(res, {user, token}, "AUTH_S001");
        }else{
            return responser.success(res, null, "AUTH_E004");
        }

    }catch(error){
        console.log(error);
        return responser.error(res, null, "AUTH_E001");
    }
}

module.exports = {
    googleAuth,
    githubAuth,
    linkedinAuth,
    authCallback,
    signupWithEmail,
    loginWithEmail,
    
}