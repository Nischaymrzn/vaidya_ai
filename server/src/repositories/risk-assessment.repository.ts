import {
  RiskAssessment,
  RiskAssessmentDb,
  RiskAssessmentDocument,
} from "../models/risk-assessment.model";
import { RiskAssessmentType } from "../types/risk-assessment.types";

export interface IRiskAssessmentRepository {
  create(data: Partial<RiskAssessmentType>): Promise<RiskAssessmentDocument>;
  getForUser(id: string, userId: string): Promise<RiskAssessmentDb | null>;
  getAllForUser(userId: string): Promise<RiskAssessmentDb[]>;
  getLatestForUser(userId: string): Promise<RiskAssessmentDb | null>;
}

export class RiskAssessmentRepository implements IRiskAssessmentRepository {
  async create(
    data: Partial<RiskAssessmentType>,
  ): Promise<RiskAssessmentDocument> {
    return RiskAssessment.create(data);
  }

  async getForUser(
    id: string,
    userId: string,
  ): Promise<RiskAssessmentDb | null> {
    return RiskAssessment.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(userId: string): Promise<RiskAssessmentDb[]> {
    const records = await RiskAssessment.find({ userId })
      .sort({ assessmentDate: -1, createdAt: -1 })
      .lean();
    return records as RiskAssessmentDb[];
  }

  async getLatestForUser(userId: string): Promise<RiskAssessmentDb | null> {
    const record = await RiskAssessment.findOne({ userId })
      .sort({ assessmentDate: -1, createdAt: -1 })
      .lean();
    return record as RiskAssessmentDb | null;
  }
}
