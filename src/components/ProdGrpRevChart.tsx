// src/components/ProdGrpRevChart.tsx
"use client";

import { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ApiRow = {
  ProductGroup: string;
  Revenue: number;
};

interface ProdGrpRevChartProps {
  startDate: string; // format: yyyy-mm-dd
  endDate: string;   // format: yyyy-mm-dd
}

export default function ProdGrpRevChart({ startDate, endDate }: ProdGrpRevChartProps) {
  const [data, setData] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!startDate || !endDate) return;

    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/prodGrpRev?startDate=${startDate}&endDate=${endDate}`);
        const json = await res.json();

        if (!Array.isArray(json)) {
          console.error("Unexpected API response:", json);
          setData([]);
          return;
        }

        setData(json);
      } catch (err) {
        console.error("Error fetching revenue by product group:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return <div className="p-4">Loading revenue by product group...</div>;
  }

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
          data={data}
          keys={["Revenue"]}
          indexBy="ProductGroup"
          margin={{ top: 20, right: 40, bottom: 40, left: 80 }}
          padding={0.3}
          colors={{ scheme: "set2" }} // lighter distinct colors
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
              <strong style={{ color }}>{indexValue}</strong>:{" "}
              {Number(value).toLocaleString()}
            </div>
          )}
          animate={true}
        />
      </CardContent>
    </Card>
  );
}
