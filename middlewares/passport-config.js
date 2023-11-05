const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: FacebookStrategy } = require('passport-facebook');

module.exports = ()=>{

    passport.use(
        new GoogleStrategy(
            {
              clientID: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackURL: process.env.GOOGLE_CALLBACK_URL
            },
            async(accessToken, refreshToken, profile, done) => {
                console.log(profile);
                return done(null, profile);
            }
        )
    );

    passport.use(
      new FacebookStrategy(
          {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL
          },
          async(accessToken, refreshToken, profile, done) => {
              console.log(profile);
              return done(null, profile);
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