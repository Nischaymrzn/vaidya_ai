import {
  RiskVitals,
  RiskVitalsDb,
  RiskVitalsDocument,
} from "../models/risk-vitals.model";

export interface IRiskVitalsRepository {
  createMany(data: RiskVitalsDb[]): Promise<RiskVitalsDocument[]>;
  getByRisk(riskId: string): Promise<RiskVitalsDb[]>;
}

export class RiskVitalsRepository implements IRiskVitalsRepository {
  async createMany(data: RiskVitalsDb[]): Promise<RiskVitalsDocument[]> {
    if (!data.length) return [];
    return RiskVitals.insertMany(data);
  }

  async getByRisk(riskId: string): Promise<RiskVitalsDb[]> {
    const records = await RiskVitals.find({ riskId }).lean();
    return records as RiskVitalsDb[];
  }
}
