import z from "zod";

export const AnalyticsQueryDto = z.object({
  months: z.coerce.number().min(1).max(24).optional(),
});

export type AnalyticsQueryPayload = z.infer<typeof AnalyticsQueryDto>;
