import jwt from "jsonwebtoken"
import { Response, Request, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env";
import ApiError from "../exceptions/apiError";
import asyncHandler from "../utils/asyncHandler";
import errorMessages from "../constants/errorMessages";
import { UserRepository } from "../repositories/user.repository";
import { AuthUser } from "../types/user.types";

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

const userRepository = new UserRepository()

const isAuthenticated = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.USER.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.NOT_FOUND);
  }

  let decoded: Record<string, any>;
  try {
    decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as Record<string, any>;
  } catch (_err) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.INVALID_TOKEN);
  }
  if (!decoded || !decoded.id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.INVALID_TOKEN);
  }

  const user = await userRepository.getUserById(decoded.id)
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN.TOKEN_USER_NOT_FOUND)

  req.user = user
  return next();
})

const adminOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try{
      if(req.user && req.user.role === "admin"){
          next();
      }else{
          throw new ApiError(403, "Forbidden, Admins only");
      }
  }catch(error: Error | any){
      return res.status(error.statusCode || 403).json(
          { success: false, message: error.message || "Forbidden"}
      );
  }
}

export const middlewares = { isAuthenticated, adminOnlyMiddleware }
