import { StatGrid, type StatItem } from "@/components/ui/stat-grid";

export default function Summary({ items }: { items: StatItem[] }) {
  return <StatGrid items={items} columns={4} />;
}
