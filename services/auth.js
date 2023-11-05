const depManager = require("../core/depManager");
const { generateTokens } = require("./token");

async function googleAuth(req, res, next){
    const passport = req.passport;
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
}

async function githubAuth(req, res, next){
    const passport = req.passport;
    passport.authenticate('github')(req, res, next);
}

async function linkedinAuth(req, res, next){
    const passport = req.passport;
    passport.authenticate('linkedin')(req, res, next);
}

async function googleCallback(req, res){

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

async function githubCallback(req, res){

    const user = req.user;
    
    let oldUser = await depManager.USER.getUserModel().findOne({provider: user.provider, providerId: user.providerId});

    let accessToken;

    if(oldUser!=null){

        oldUser.lastLogin = Date.now();
        await oldUser.save();

        accessToken = generateTokens(oldUser._id).accessToken;

    }else{
        let firstName;
        let lastName;
        
        if(user.displayName){
            const nameArray = user.displayName.split(' ');
            if(nameArray.length>=2){
                firstName=nameArray[0];
                lastName=nameArray.slice(1).join(' ');
            }else{
                firstName=nameArray[0];
                lastName=nameArray[0];
            }
        }

        const data = {
            firstName: firstName,
            lastName: lastName,
            bio: user.bio,
            company: user.company,
            location: user.location,
            socialLinks: [
                {
                    platform: 'blog',
                    url: user.blog
                },
                {
                    platform: 'github',
                    url: user.profileUrl
                }
            ],
            email: user.email,
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

module.exports = {
    googleAuth,
    githubAuth,
    linkedinAuth,
    googleCallback,
    githubCallback
}