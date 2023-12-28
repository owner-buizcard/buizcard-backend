const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const PipedriveOAuth2Strategy = require('passport-oauth').OAuth2Strategy;

module.exports = ()=>{

    passport.use(
        new GoogleStrategy(
            {
              clientID: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackURL: process.env.SPREADSHEET_CALL_BACK,
              accessType: 'offline',
              prompt: 'consent', 
              scope: ['profile', 'email', 'https://www.googleapis.com/auth/spreadsheets']
            },
            async(accessToken, refreshToken, profile, done) => {
                const user = {
                    accessToken,
                    refreshToken,
                    profile
                };
                return done(null, user);
            }
        )
    );

    passport.use('pipedrive', new PipedriveOAuth2Strategy({
        authorizationURL: 'https://oauth.pipedrive.com/oauth/authorize',
        tokenURL: 'https://oauth.pipedrive.com/oauth/token',
        clientID: process.env.PIPEDRIVE_CLIENT_ID,
        clientSecret: process.env.PIPEDRIVE_CLIENT_SECRET,
        callbackURL: process.env.PIPEDRIVE_CALL_BACK
      },
      (accessToken, refreshToken, profile, done) => {
        const user = {
            accessToken,
            refreshToken,
            profile
        };
        return done(null, user);
      }
    ));
    

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
      
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    return passport;
}