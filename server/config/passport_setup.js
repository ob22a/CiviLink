import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../src/models/User.js";

// Only initialize Google OAuth if clientID and clientSecret exist
if (process.env.clientID && process.env.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        callbackURL: "/api/v1/auth/google/callback",
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("passport callback function fired");
          const email = profile.emails[0].value;

          let user = await User.findOne({ email });

          // If user exists but was local → link Google
          if (user && !user.googleId) {
            user.googleId = profile.id;
            await user.save();

            console.log("Now you have logged in using only Google!!!");
            user.message = "Log in successful";
            user.status = 200;
            return done(null, user);
          }

          // If user exists and is already Google user
          if (user) {
            user.message = "Log in successful";
            user.status = 200;
            return done(null, user);
          }

          // New Google user
          user = await new User({
            fullName: profile.displayName,
            email,
            googleId: profile.id,
          }).save();

          user.message = "Registration successful";
          user.status = 201;
          done(null, user);
        } catch (err) {
          console.log(err);
          done(err, null);
        }
      }
    )
  );
} else {
  console.log("Google OAuth not initialized: missing clientID or clientSecret");
}
