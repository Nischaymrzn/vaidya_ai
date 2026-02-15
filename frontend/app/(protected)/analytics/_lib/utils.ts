import type { AnalyticsSummary } from "@/lib/definition";

export type ProviderNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  count: number;
};

export type ProviderLink = {
  from: string;
  to: string;
};

export type ProviderGraph = {
  nodes: ProviderNode[];
  links: ProviderLink[];
};

export const formatNumber = (value: number) => value.toLocaleString("en-US");

export const buildProviderNodes = (
  providers: AnalyticsSummary["providerNetwork"]["topProviders"],
): ProviderGraph => {
  const center = { x: 260, y: 128 };
  const radius = 95;
  const nodes = providers.map((provider, index) => {
    const angle = (index / providers.length) * Math.PI * 2 - Math.PI / 2;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;
    const size = Math.max(16, Math.min(26, 14 + provider.count * 2));
    return {
      id: `provider-${index}`,
      label: provider.name,
      x,
      y,
      size,
      count: provider.count,
    };
  });

  return {
    nodes,
    links: nodes.map((node) => ({ from: "patient", to: node.id })),
  };
};
