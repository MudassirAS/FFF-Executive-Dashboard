// src/components/ProdGrpRevChart.tsx
"use client";

import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ApiRow = {
  ProductGroup: string;
  Revenue: number;
};

interface ProdGrpRevChartProps {
  data?: ApiRow[] | null;
}

export default function ProdGrpRevChart({ data }: ProdGrpRevChartProps) {
  // show loading while parent fetches
  if (data === undefined) {
    return <div className="p-4">Loading revenue by product group...</div>;
  }

  const rows = data ?? [];

  // Format numbers with k suffix
  const formatRevenue = (value: number) => {
    if (value >= 1000) {
      return Math.round(value / 1000) + "k";
    }
    return Math.round(value).toString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue by Product Group</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ResponsiveBar
          data={rows}
          keys={["Revenue"]}
          indexBy="ProductGroup"
          margin={{ top: 20, right: 40, bottom: 40, left: 80 }}
          padding={0.3}
          colors={{ scheme: "set2" }}
          axisBottom={{
            legend: "Product Group",
            legendPosition: "middle",
            legendOffset: 35,
          }}
          axisLeft={{
            legend: "Revenue",
            legendPosition: "middle",
            legendOffset: -60,
            format: formatRevenue,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          label={(d) => formatRevenue(Number(d.value))}
          tooltip={({ indexValue, value, color }) => (
            <div className="bg-white p-2 shadow border rounded text-sm">
              <strong style={{ color }}>{indexValue}</strong>: {Number(value).toLocaleString()}
            </div>
          )}
          animate={true}
        />
      </CardContent>
    </Card>
  );
}
