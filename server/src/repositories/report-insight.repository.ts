import {
  ReportInsight,
  ReportInsightDb,
  ReportInsightDocument,
} from "../models/report-insight.model";

export interface IReportInsightRepository {
  createMany(data: ReportInsightDb[]): Promise<ReportInsightDocument[]>;
}

export class ReportInsightRepository implements IReportInsightRepository {
  async createMany(data: ReportInsightDb[]): Promise<ReportInsightDocument[]> {
    if (!data.length) return [];
    return ReportInsight.insertMany(data);
  }
}
