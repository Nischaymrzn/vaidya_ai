import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/lib/definition";
import { formatNumber, type ProviderGraph } from "../_lib/utils";
import Empty from "./empty";

type NetworkProps = {
  stats: AnalyticsSummary["providerNetwork"];
  graph: ProviderGraph | null;
};

export default function Network({ stats, graph }: NetworkProps) {
  const PRIMARY = "#1F7AE0";
  
  if (!graph) {
    return (
      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm lg:col-span-12">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">Care network</CardTitle>
          <CardDescription className="text-sm text-slate-500">Connected providers and recent touchpoints.</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty label="Add providers to populate the care network." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm lg:col-span-12">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Care network</CardTitle>
        <CardDescription className="text-sm text-slate-500">Connected providers and recent touchpoints.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 lg:col-span-2">
            <svg viewBox="0 0 520 256" className="relative h-64 w-full">
              {graph.links.map((link) => {
                const from = { x: 260, y: 128 };
                const to = graph.nodes.find((node) => node.id === link.to);
                if (!to) return null;
                return (
                  <line
                    key={link.to}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="rgba(148, 163, 184, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })}
              {graph.nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill="white"
                    stroke={PRIMARY}
                    strokeWidth="2"
                    strokeOpacity="0.7"
                  />
                  <text
                    x={node.x}
                    y={node.y + node.size + 12}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-medium"
                  >
                    {node.label.length > 12 ? `${node.label.slice(0, 12)}...` : node.label}
                  </text>
                </g>
              ))}
              <circle
                cx={260}
                cy={128}
                r={36}
                fill={`${PRIMARY}15`}
                stroke={PRIMARY}
                strokeWidth="2"
                strokeOpacity="0.8"
              />
              <text
                x={260}
                y={132}
                textAnchor="middle"
                className="fill-slate-900 text-xs font-semibold"
              >
                Patient
              </text>
            </svg>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3">
              {[
                { label: "Active Providers", value: formatNumber(stats.activeProviders) },
                { label: "Referrals YTD", value: formatNumber(stats.referralsYtd) },
                { label: "Care Touchpoints", value: formatNumber(stats.careTouchpoints) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Top providers</p>
              <div className="mt-3 space-y-2">
                {stats.topProviders.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{provider.name}</span>
                    <Badge className="bg-[#1F7AE0]/10 text-[#1F7AE0]">
                      {formatNumber(provider.count)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
