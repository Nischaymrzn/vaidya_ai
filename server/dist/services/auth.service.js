"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = require("../utils/bcrypt");
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const errorMessages_1 = __importDefault(require("../constants/errorMessages"));
const user_repository_1 = require("../repositories/user.repository");
const env_1 = require("../config/env");
const mailer_1 = require("../utils/mailer");
const userRepository = new user_repository_1.UserRepository();
class UserServices {
    async createUser(data) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (existingUser) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, errorMessages_1.default.USER.EXIST);
        }
        const hashedPassword = await bcrypt_1.bcryptUtil.generate(data.password, 12);
        const { name } = data;
        const user = await userRepository.createUser({
            ...data,
            name,
            password: hashedPassword,
        });
        return {
            id: user._id,
            email: user.email,
            name: user.name,
        };
    }
    async loginUser(data) {
        const existingUser = await userRepository.getUserWithPasswordByEmail(data.email);
        if (!existingUser) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, errorMessages_1.default.USER.NOT_FOUND);
        }
        if (!existingUser.password) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, errorMessages_1.default.USER.PASSWORD_NOT_SET);
        }
        const validatedPassword = await bcrypt_1.bcryptUtil.compare(data.password, existingUser.password);
        if (!validatedPassword) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, errorMessages_1.default.USER.INVALID_CREDENTIALS);
        }
        const payload = {
            id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role,
        };
        const userObj = existingUser.toObject();
        const { password, ...safeUser } = userObj;
        const { accessToken, refreshToken } = (0, generateToken_1.default)(payload);
        return { accessToken, refreshToken, user: safeUser };
    }
    async getCurrentUser(id) {
        const currentUser = await userRepository.getUserById(id);
        return currentUser;
    }
    async sendResetPasswordEmail(email) {
        if (!email) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, errorMessages_1.default.EMAIL.REQUIRED);
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            return null;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, env_1.env.PASSWORD_RESET_SECRET, {
            expiresIn: env_1.env.PASSWORD_RESET_EXPIRY,
        });
        const resetLink = `${env_1.env.CLIENT_URL}/reset-password?token=${token}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1F7AE0; margin-bottom: 16px;">Reset your Vaidya.ai password</h2>
        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to set a new password:
        </p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #1F7AE0; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
          This link will expire in 1 hour. If you didn&#39;t request this, you can safely ignore this email.
        </p>
      </div>
    `;
        await (0, mailer_1.sendEmail)(user.email, "Reset your Vaidya.ai password", html);
        return { id: user._id, email: user.email };
    }
    async findOrCreateByGoogle(profile) {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        if (!email) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Email not provided by Google");
        }
        let user = await userRepository.getUserByGoogleId(googleId);
        if (user) {
            const userObj = user.toObject();
            const { password, ...safeUser } = userObj;
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role,
            };
            const { accessToken, refreshToken } = (0, generateToken_1.default)(payload);
            return { accessToken, refreshToken, user: safeUser };
        }
        const existingByEmail = await userRepository.getUserByEmail(email);
        if (existingByEmail) {
            await userRepository.updateOneUser(String(existingByEmail._id), {
                googleId,
                isEmailVerified: true,
            });
            user = await userRepository.getUserById(String(existingByEmail._id));
        }
        else {
            user = await userRepository.createUser({
                name: profile.displayName ?? email.split("@")[0],
                email,
                googleId,
                isEmailVerified: true,
                role: "user",
            });
        }
        if (!user) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create or update user");
        }
        const userObj = user.toObject ? user.toObject() : user;
        const { password, ...safeUser } = userObj;
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };
        const { accessToken, refreshToken } = (0, generateToken_1.default)(payload);
        return { accessToken, refreshToken, user: safeUser };
    }
    async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Token and new password are required.");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.PASSWORD_RESET_SECRET);
            const user = await userRepository.getUserById(decoded.id);
            if (!user) {
                throw new apiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, errorMessages_1.default.USER.NOT_FOUND);
            }
            const hashedPassword = await bcrypt_1.bcryptUtil.generate(newPassword, 12);
            await userRepository.updateOneUser(decoded.id, {
                password: hashedPassword,
            });
            return { id: decoded.id, email: user.email };
        }
        catch (error) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid or expired token.");
        }
    }
}
exports.UserServices = UserServices;
