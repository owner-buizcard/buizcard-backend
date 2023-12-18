const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');

module.exports = ()=>{

    passport.use(
        new GoogleStrategy(
            {
              clientID: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackURL: process.env.GOOGLE_CALL_BACK
            },
            async(accessToken, refreshToken, profile, done) => {
                console.log(profile);
                return done(null, profile);
            }
        )
    );

    passport.use(
      new GitHubStrategy (
          {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALL_BACK,
            scope: ['user:email', 'read:user']
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