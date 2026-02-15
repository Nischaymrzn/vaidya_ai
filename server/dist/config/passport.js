"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = configurePassport;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const auth_service_1 = require("../services/auth.service");
const env_1 = require("./env");
const userServices = new auth_service_1.UserServices();
function configurePassport() {
    if (!env_1.env.GOOGLE_CLIENT_ID || !env_1.env.GOOGLE_CLIENT_SECRET) {
        return;
    }
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.GOOGLE_CLIENT_ID,
        clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env_1.env.SERVER_URL.replace(/\/$/, "")}/${env_1.env.VERSION}/api/auth/google/callback`,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const result = await userServices.findOrCreateByGoogle({
                id: profile.id,
                displayName: profile.displayName ?? undefined,
                emails: profile.emails?.map((e) => ({
                    value: e.value,
                    verified: e.verified,
                })),
                photos: profile.photos?.map((p) => ({ value: p.value })),
            });
            done(null, result);
        }
        catch (err) {
            done(err, undefined);
        }
    }));
}
