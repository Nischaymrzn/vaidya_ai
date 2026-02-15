import { Request, Response } from "express";
import z from "zod";
import { RiskAssessmentService } from "../services/risk-assessment.service";
import { GenerateRiskAssessmentDto } from "../dtos/risk-assessment.dto";

const riskAssessmentService = new RiskAssessmentService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class RiskAssessmentController {
  async generate(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsed = GenerateRiskAssessmentDto.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsed.error) });
      }

      const result = await riskAssessmentService.generateAssessment(
        userId,
        parsed.data,
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: "Risk assessment generated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAssessments(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await riskAssessmentService.getAssessments(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Risk assessments fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAssessmentById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const riskId = req.params.id;
      const result = await riskAssessmentService.getAssessmentById(
        userId,
        riskId,
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: "Risk assessment fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
