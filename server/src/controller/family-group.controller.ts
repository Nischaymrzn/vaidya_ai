import { Request, Response } from "express";
import z from "zod";
import {
  AddFamilyMemberDto,
  CreateFamilyGroupDto,
  CreateFamilyInviteDto,
  JoinFamilyInviteDto,
  UpdateFamilyMemberDto,
} from "../dtos/family.dto";
import { FamilyGroupService } from "../services/family-group.service";

const familyGroupService = new FamilyGroupService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class FamilyGroupController {
  async getMyGroup(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const group = await familyGroupService.getFamilyGroupForUser(userId);
      return res.status(200).json({
        success: true,
        data: group,
        message: "Family group fetched",
      });
    } catch (error: Error | any) {
      const status = error.status || error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMyGroupSummary(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const summary = await familyGroupService.getGroupSummaryForUser(userId);
      return res.status(200).json({
        success: true,
        data: summary,
        message: "Family group summary fetched",
      });
    } catch (error: Error | any) {
      const status = error.status || error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async createGroup(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateFamilyGroupDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const group = await familyGroupService.createFamilyGroup(
        userId,
        parsedData.data.name,
      );

      return res.status(201).json({
        success: true,
        data: group,
        message: "Family group created",
      });
    } catch (error: Error | any) {
      const status = error.status || error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async createInvite(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateFamilyInviteDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const groupId = req.params.groupId;
      const invite = await familyGroupService.createInvite(
        groupId,
        userId,
        parsedData.data.expiresInDays,
      );

      return res.status(201).json({
        success: true,
        data: invite,
        message: "Invite link created",
      });
    } catch (error: Error | any) {
      const status = error.status || error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsedData = AddFamilyMemberDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const groupId = req.params.groupId;
      const updatedGroup = await familyGroupService.addMemberByUserId(
        groupId,
        userId,
        parsedData.data.userId,
        parsedData.data.relation,
      );

      return res.status(200).json({
        success: true,
        data: updatedGroup,
        message: "Family member added",
      });
    } catch (error: Error | any) {
      const status = error.status || error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async joinWithInvite(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsedData = JoinFamilyInviteDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const token = req.params.token;
      const group = await familyGroupService.joinWithInvite(
        token,
        userId,
        parsedData.data.relation,
      );

      return res.status(200).json({
        success: true,
        data: group,
        message: "Joined family group",
      });
    } catch (error: Error | any) {
      const status = error.status || error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateMemberRelation(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateFamilyMemberDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const groupId = req.params.groupId;
      const memberId = req.params.memberId;
      const updatedGroup = await familyGroupService.updateMemberRelation(
        groupId,
        userId,
        memberId,
        parsedData.data.relation,
      );

      return res.status(200).json({
        success: true,
        data: updatedGroup,
        message: "Family member relation updated",
      });
    } catch (error: Error | any) {
      const status = error.status || error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
