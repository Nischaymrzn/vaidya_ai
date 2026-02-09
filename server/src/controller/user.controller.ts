import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import z from "zod";
import { UpdateUserDto } from "../dtos/user.dto";
import { uploadImageBuffer } from "../utils/cloudinary";
import { env } from "../config/env";

const userService = new UserService();

export class UserController {
  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
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
      const updatedUser = await userService.updateOneUser(
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
      await userService.deleteOneUser(userId);
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
