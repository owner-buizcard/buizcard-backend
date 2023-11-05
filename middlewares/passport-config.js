const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: LinkedInStrategy } = require('passport-linkedin-oauth2');
const { Strategy: GitHubStrategy } = require('passport-github2');

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
        new LinkedInStrategy(
          {
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: process.env.LINKEDIN_CALLBACK_URL,
            scope: ['email', 'profile']
          },
          (token, tokenSecret, profile, done) => {
            return done(null, profile);
          }
        )
      );

    passport.use(
        new GitHubStrategy(
          {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL
          },
          (accessToken, refreshToken, profile, done) => {
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