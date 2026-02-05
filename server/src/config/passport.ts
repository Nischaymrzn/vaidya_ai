import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { UserServices } from "../services/auth.service";
import { env } from "./env";

const userServices = new UserServices();

export function configurePassport() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.SERVER_URL.replace(/\/$/, "")}/${env.VERSION}/api/auth/google/callback`,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          const result = await userServices.findOrCreateByGoogle({
            id: profile.id,
            displayName: profile.displayName ?? undefined,
            emails: profile.emails?.map((e: { value: string; verified: boolean }) => ({
              value: e.value,
              verified: e.verified,
            })),
            photos: profile.photos?.map((p: { value: string }) => ({ value: p.value })),
          });
          done(null, result as unknown as Express.User);
        } catch (err) {
          done(err as Error, undefined);
        }
      }
    )
  );
}
