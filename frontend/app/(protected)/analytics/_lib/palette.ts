const PRIMARY = "#1F7AE0";

export const PALETTE = {
  deep: "#0f172a",
  ocean: PRIMARY,
  sky: PRIMARY,
  tide: PRIMARY,
  amber: "#f59e0b",
  coral: "#f97316",
  mint: "#5eead4",
  slate: "#94a3b8",
  fog: "#e2e8f0",
} as const;

export const severityColors: Record<string, string> = {
  Mild: PRIMARY,
  Moderate: PRIMARY,
  Severe: PRIMARY,
  Unspecified: PALETTE.slate,
};
