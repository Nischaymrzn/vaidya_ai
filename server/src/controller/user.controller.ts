import { AdminUserService } from "../services/user.service";
import { Request, Response } from "express";
import z from "zod";
import { CreateUserDTO, UpdateUserDto } from "../dtos/user.dto";
import { uploadImageBuffer } from "../utils/cloudinary";
import { env } from "../config/env";

const adminUserService = new AdminUserService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      // Handle profile picture upload if provided
      if (req.file?.buffer) {
        const { url } = await uploadImageBuffer(req.file.buffer, {
          folder: `${env.CLOUDINARY_FOLDER}/users`,
        });
        parsedData.data.profilePicture = url;
      }
      const newUser = await adminUserService.createUser(parsedData.data);
      return res
        .status(201)
        .json({ success: true, data: newUser, message: "User created successfully" });
    } catch (error: Error | any) {
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }
  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await adminUserService.getUserById(userId);
      return res
        .status(200)
        .json({ success: true, data: user, message: "User Fetched" });
    } catch (error: Error | any) {
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await adminUserService.getAllUsers({ page, limit });
      return res
        .status(200)
        .json({
          success: true,
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasNext: result.hasNext,
            hasPrev: result.hasPrev,
          },
          message: "Users Fetched",
        });
    } catch (error: Error | any) {
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }
  async updateOneUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const parsedData = UpdateUserDto.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) }); // z.prettifyError - better error messages (zod)
      }
      if (req.file?.buffer) {
        const { url } = await uploadImageBuffer(req.file.buffer, {
          folder: `${env.CLOUDINARY_FOLDER}/users`,
        });
        parsedData.data.profilePicture = url;
      }
      const updatedUser = await adminUserService.updateOneUser(
        userId,
        parsedData.data,
      );
      return res
        .status(200)
        .json({ success: true, data: updatedUser, message: "User Updated" });
    } catch (error: Error | any) {
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }
  async deleteOneUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      await adminUserService.deleteOneUser(userId);
      return res.status(200).json({ success: true, message: "User Deleted" });
    } catch (error: Error | any) {
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }
}
