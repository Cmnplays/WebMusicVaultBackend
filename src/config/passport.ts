import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env";
import User from "../models/user.model";
import { generateVerifiedUsername } from "../services/generateVerifiedUsername";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v1/auth/google/callback",
    },
    async (
      _accessToken,
      _refreshToken,
      profile,
      cb /* can also use don or any other keyword instead of cb*/
    ) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const email = profile.emails?.[0].value;
          user = await User.create({
            username: await generateVerifiedUsername(email!),
            email,
            displayName: profile.displayName,
            avatar: profile.photos?.[0].value,
            googleId: profile.id,
            authProvider: "google",
            isEmailVerified: true,
          });
        }
        return cb(null, user);
      } catch (err) {
        cb(err, undefined);
      }
    }
  )
);
