export type InsightItem = {
  title: string
  detail: string
  level: "High" | "Medium" | "Info"
  tag: string
  source: string
  time: string
  action?: string
}
