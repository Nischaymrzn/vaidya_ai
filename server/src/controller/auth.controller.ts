import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { UserServices } from "../services/auth.service";
import responseMessages from "../constants/responseMessages";
import {
  CreateUserDTO,
  googleMobileLoginDTO,
  loginUserDTO,
  requestPasswordResetDTO,
  resetPasswordDTO,
} from "../dtos/user.dto";
import errorMessages from "../constants/errorMessages";

const userServices = new UserServices();

export class AuthController {
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreateUserDTO.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: parsedData.error.flatten().fieldErrors,
      });
    }
    const createdUser = await userServices.createUser(parsedData.data);

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(201, responseMessages.USER.CREATED, createdUser));
  });

  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = loginUserDTO.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: parsedData.error.flatten().fieldErrors,
      });
    }

    const { accessToken, refreshToken, user } = await userServices.loginUser(
      parsedData.data,
    );

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(201, responseMessages.USER.LOGGED_IN, {
        user,
        accessToken,
        refreshToken,
      }),
    );
  });

  googleMobileLogin = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = googleMobileLoginDTO.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: parsedData.error.flatten().fieldErrors,
      });
    }

    const { accessToken, refreshToken, user } =
      await userServices.loginWithGoogleIdToken(parsedData.data.idToken);

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(201, responseMessages.USER.LOGGED_IN, {
        user,
        accessToken,
        refreshToken,
      }),
    );
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        errorMessages.USER.UNAUTHORIZED,
      );
    }

    const userId =
      req.user?.id ?? (req.user?._id != null ? String(req.user._id) : "");
    const currentUser = await userServices.getCurrentUser(userId);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.USER.RETRIEVED,
        currentUser,
      ),
    );
  });

  sendResetPasswordEmail = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = requestPasswordResetDTO.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: parsedData.error.flatten().fieldErrors,
      });
    }

    await userServices.sendResetPasswordEmail(parsedData.data.email);

    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        "If the email is registered, a reset link has been sent.",
        {},
      ),
    );
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = resetPasswordDTO.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: parsedData.error.flatten().fieldErrors,
      });
    }

    const token = req.params.token as string;
    await userServices.resetPassword(token, parsedData.data.newPassword);

    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        "Password has been reset successfully.",
        {},
      ),
    );
  });
}
