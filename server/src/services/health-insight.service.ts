import ApiError from "../exceptions/apiError";
import { HealthInsightRepository } from "../repositories/health-insight.repository";

const healthInsightRepository = new HealthInsightRepository();

export class HealthInsightService {
  async getInsights(userId: string, riskId?: string) {
    return healthInsightRepository.getAllForUser(userId, riskId);
  }

  async getInsightById(userId: string, insightId: string) {
    const insight = await healthInsightRepository.getForUser(
      insightId,
      userId,
    );
    if (!insight) throw new ApiError(404, "Insight not found");
    return insight;
  }
}
