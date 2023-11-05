const bcrypt = require('bcryptjs');
const depManager = require("../core/depManager");
const { generateTokens } = require("./token");
const responser = require("../core/responser");

async function facebookAuth(req, res, next){
    const passport = req.passport;
    passport.authenticate('facebook')(req, res, next);
}

async function googleAuth(req, res, next){
    const passport = req.passport;
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
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

    res.redirect(`${process.env.AUTH_DOMAIN}/auth/callback?token=${accessToken}`);
}

async function signupWithEmail(req, res){
    try{
        const [email, password] = req.data;
        const UserModel = depManager.USER.getUserModel();

        const user = await UserModel.findOne({email: email});

        if(user){
            return responser.error(res, null, "AUTH_E001");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            email: email,
            password: hashedPassword,
            provider: "EMAIL",
            providerId: email,
            registrationStatus: "registered"
        };

        const createdUser = await UserModel.create(data);
        const [accessToken, refreshToken] = generateTokens(createdUser._id);

        return responser.success(res, {createdUser, accessToken, refreshToken}, "AUTH_S001");
        
    }catch(error){
        return responser.error(res, null, "AUTH_E001");
    }
}


async function loginWithEmail(req, res){
    try{
        const [email, password] = req.data;
        const UserModel = depManager.USER.getUserModel();

        const user = await UserModel.findOne({email: email});

        if(!user){
            return responser.error(res, null, "AUTH_E001");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(passwordMatch){
            const [accessToken, refreshToken] = generateTokens(createdUser._id);
            return responser.success(res, {user, accessToken, refreshToken}, "AUTH_S001");
        }else{
            return responser.error(res, null, "AUTH_E001");
        }

    }catch(error){
        return responser.error(res, null, "AUTH_E001");
    }
}

module.exports = {
    googleAuth,
    facebookAuth,
    authCallback,
    signupWithEmail,
    loginWithEmail
}