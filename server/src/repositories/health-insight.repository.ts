import {
  HealthInsight,
  HealthInsightDb,
  HealthInsightDocument,
} from "../models/health-insight.model";
import { HealthInsightType } from "../types/health-insight.types";

export interface IHealthInsightRepository {
  createMany(data: HealthInsightType[]): Promise<HealthInsightDocument[]>;
  getForUser(id: string, userId: string): Promise<HealthInsightDb | null>;
  getAllForUser(userId: string, riskId?: string): Promise<HealthInsightDb[]>;
  getByContext(
    userId: string,
    contextType: string,
    contextHash: string,
  ): Promise<HealthInsightDb[]>;
  deleteByContext(
    userId: string,
    contextType: string,
    contextHash: string,
  ): Promise<boolean>;
}

export class HealthInsightRepository implements IHealthInsightRepository {
  async createMany(
    data: HealthInsightType[],
  ): Promise<HealthInsightDocument[]> {
    if (!data.length) return [];
    return HealthInsight.insertMany(data as unknown as HealthInsightDb[]);
  }

  async getForUser(
    id: string,
    userId: string,
  ): Promise<HealthInsightDb | null> {
    return HealthInsight.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(
    userId: string,
    riskId?: string,
  ): Promise<HealthInsightDb[]> {
    const query: Record<string, unknown> = { userId };
    if (riskId) query.generatedFromRisk = riskId;
    const records = await HealthInsight.find(query)
      .sort({ createdAt: -1 })
      .lean();
    return records as HealthInsightDb[];
  }

  async getByContext(
    userId: string,
    contextType: string,
    contextHash: string,
  ): Promise<HealthInsightDb[]> {
    const records = await HealthInsight.find({
      userId,
      contextType,
      contextHash,
    })
      .sort({ createdAt: -1 })
      .lean();
    return records as HealthInsightDb[];
  }

  async deleteByContext(
    userId: string,
    contextType: string,
    contextHash: string,
  ): Promise<boolean> {
    const result = await HealthInsight.deleteMany({
      userId,
      contextType,
      contextHash,
    });
    return result.acknowledged ?? false;
  }
}
