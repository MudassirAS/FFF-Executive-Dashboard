// src/components/Top10CustomersChart.tsx
"use client";

import { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

type CustomerRow = {
  customerId: string;
  CustomerName: string;
  TotalVolume?: number;
  TotalRevenue?: number;
};

interface Props {
  top10Volume?: CustomerRow[] | null;
  top10Revenue?: CustomerRow[] | null;
}

export default function Top10CustomersChart({ top10Volume, top10Revenue }: Props) {
  const [metric, setMetric] = useState<"volume" | "revenue">("volume");

  // Loading while either dataset is undefined (parent still fetching)
  if (top10Volume === undefined || top10Revenue === undefined) {
    return <div className="p-4">Loading top 10 customers...</div>;
  }

  const sourceData = metric === "revenue" ? (top10Revenue ?? []) : (top10Volume ?? []);

  // Prepare data for Nivo bar chart
  const barData = sourceData.map((d) => ({
    customer: d.CustomerName,
    value: metric === "revenue" ? d.TotalRevenue ?? 0 : d.TotalVolume ?? 0,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Top 10 Customers</CardTitle>

        {/* Metric Selector */}
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as "volume" | "revenue")}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="volume">Order Volume</option>
          <option value="revenue">Revenue</option>
        </select>
      </CardHeader>

      <CardContent className="h-[500px]">
        <ResponsiveBar
          data={barData}
          keys={["value"]}
          indexBy="customer"
          layout="horizontal"
          margin={{ top: 20, right: 30, bottom: 60, left: 180 }}
          padding={0.5}
          colors={() => "#08a4e2ff"}
          borderRadius={6}
          axisBottom={{
            legend: metric === "revenue" ? "Revenue" : "Order Volume",
            legendPosition: "middle",
            legendOffset: 40,
            format: ">-.2s",
          }}
          axisLeft={{
            legend: "Customers",
            legendPosition: "end",
            legendOffset: -120,
          }}
          enableLabel={true}
          labelSkipWidth={20}
          labelSkipHeight={12}
          labelTextColor="#fff"
          valueFormat=">-.2s"
          tooltip={({ indexValue, value }) => (
            <div
              style={{
                background: "white",
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              {indexValue}:{" "}
              <strong>
                {metric === "revenue"
                  ? `$${Number(value).toLocaleString()}`
                  : `Volume: ${Number(value).toLocaleString()}`}
              </strong>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
