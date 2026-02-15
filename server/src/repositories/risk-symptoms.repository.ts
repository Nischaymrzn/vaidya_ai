import {
  RiskSymptoms,
  RiskSymptomsDb,
  RiskSymptomsDocument,
} from "../models/risk-symptoms.model";

export interface IRiskSymptomsRepository {
  createMany(data: RiskSymptomsDb[]): Promise<RiskSymptomsDocument[]>;
  getByRisk(riskId: string): Promise<RiskSymptomsDb[]>;
}

export class RiskSymptomsRepository implements IRiskSymptomsRepository {
  async createMany(data: RiskSymptomsDb[]): Promise<RiskSymptomsDocument[]> {
    if (!data.length) return [];
    return RiskSymptoms.insertMany(data);
  }

  async getByRisk(riskId: string): Promise<RiskSymptomsDb[]> {
    const records = await RiskSymptoms.find({ riskId }).lean();
    return records as RiskSymptomsDb[];
  }
}
