import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { UserServices } from "../services/auth.service";
import responseMessages from "../constants/responseMessages";
import { CreateUserDTO, loginUserDTO } from "../dtos/user.dto";
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

    return res.json(
      new ApiResponse(201, responseMessages.USER.CREATED, createdUser),
    );
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

    return res.json(
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

    const currentUser = await userServices.getCurrentUser(req.user.id);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        responseMessages.USER.RETRIEVED,
        currentUser,
      ),
    );
  });
}
