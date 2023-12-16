const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github');

module.exports = ()=>{

    passport.use(
        new GoogleStrategy(
            {
              clientID: "532842629098-ca7lrte0pjkof9btf77iqofuq59184s3.apps.googleusercontent.com",
              clientSecret: "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",
              callbackURL: "https://x9a0br47t1.execute-api.us-east-1.amazonaws.com/dev/auth/google/callback"
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
            clientID: "27baeb96fc320da34956",
            clientSecret: "a75bfed571cab31fab92501034f414cab4a080f2",
            callbackURL: "https://x9a0br47t1.execute-api.us-east-1.amazonaws.com/dev/auth/github/callback"
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