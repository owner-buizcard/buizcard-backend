const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

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

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
      
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    return passport;
}