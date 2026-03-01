import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { bcryptUtil } from "../utils/bcrypt";
import ApiError from "../exceptions/apiError";
import GenerateTokens from "../utils/generateToken";
import errorMessages from "../constants/errorMessages";
import { CreateUserDTO, loginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { env } from "../config/env";
import { sendEmail } from "../utils/mailer";
import { UserDataService } from "./user-data.service";

const userRepository = new UserRepository();
const userDataService = new UserDataService();

export interface GoogleProfile {
  id: string;
  displayName?: string;
  emails?: { value: string; verified?: boolean }[];
  photos?: { value: string }[];
}

export class UserServices {
  async createUser(data: CreateUserDTO) {
    const existingUser = await userRepository.getUserByEmail(data.email);

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, errorMessages.USER.EXIST);
    }

    const hashedPassword = await bcryptUtil.generate(data.password, 12);
    const { name } = data;
    const user = await userRepository.createUser({
      ...data,
      name,
      password: hashedPassword,
    });

    await userDataService.ensureUserData(String(user._id));

    return {
      id: user._id,
      email: user.email,
      name: user.name,
    };
  }

  async loginUser(data: loginUserDTO) {
    const existingUser = await userRepository.getUserWithPasswordByEmail(
      data.email,
    );

    if (!existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.USER.NOT_FOUND);
    }
    if (!existingUser.password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        errorMessages.USER.PASSWORD_NOT_SET,
      );
    }
    const validatedPassword = await bcryptUtil.compare(
      data.password,
      existingUser.password,
    );

    if (!validatedPassword) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        errorMessages.USER.INVALID_CREDENTIALS,
      );
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    };

    const userObj = existingUser.toObject();
    const { password, ...safeUser } = userObj;
    const { accessToken, refreshToken } = GenerateTokens(payload);

    return { accessToken, refreshToken, user: safeUser };
  }

  async getCurrentUser(id: string) {
    const currentUser = await userRepository.getUserById(id);
    return currentUser;
  }

  async sendResetPasswordEmail(email?: string) {
    if (!email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.EMAIL.REQUIRED);
    }

    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const token = jwt.sign({ id: user._id }, env.PASSWORD_RESET_SECRET, {
      expiresIn: env.PASSWORD_RESET_EXPIRY,
    });

    const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;
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

    await sendEmail(user.email, "Reset your Vaidya.ai password", html);

    return { id: user._id, email: user.email };
  }

  async findOrCreateByGoogle(profile: GoogleProfile) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email not provided by Google",
      );
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
      const { accessToken, refreshToken } = GenerateTokens(payload);
      return { accessToken, refreshToken, user: safeUser };
    }

    const existingByEmail = await userRepository.getUserByEmail(email);
    if (existingByEmail) {
      await userRepository.updateOneUser(String(existingByEmail._id), {
        googleId,
        isEmailVerified: true,
      });
      user = await userRepository.getUserById(String(existingByEmail._id));
    } else {
      user = await userRepository.createUser({
        name: profile.displayName ?? email.split("@")[0],
        email,
        googleId,
        isEmailVerified: true,
        role: "user",
      });
    }

    if (!user) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to create or update user",
      );
    }

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...safeUser } = userObj;
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    const { accessToken, refreshToken } = GenerateTokens(payload);
    await userDataService.ensureUserData(String(user._id));
    return { accessToken, refreshToken, user: safeUser };
  }

  async resetPassword(token?: string, newPassword?: string) {
    if (!token || !newPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Token and new password are required.",
      );
    }

    try {
      const decoded = jwt.verify(token, env.PASSWORD_RESET_SECRET) as {
        id: string;
      };

      const user = await userRepository.getUserById(decoded.id);
      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER.NOT_FOUND);
      }

      const hashedPassword = await bcryptUtil.generate(newPassword, 12);
      await userRepository.updateOneUser(decoded.id, {
        password: hashedPassword,
      });

      return { id: decoded.id, email: user.email };
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired token.");
    }
  }
}
