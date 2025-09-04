// src/components/PerformanceOverTimeChart.tsx
"use client";

import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PerformanceRow = {
  DeliveryDay: string; // yyyy-mm-dd
  TotalVolume: number;
  OnTimePercentage: number;
};

interface Props {
  data?: PerformanceRow[] | null;
}

export default function PerfOverTimeChart({ data }: Props) {
  // show loading while parent is still fetching
  if (data === undefined) {
    return <div className="p-4">Loading performance data...</div>;
  }

  const rows = data ?? [];

  // Prepare data for Nivo
  const barData = rows.map((d) => ({
    day: d.DeliveryDay,
    volume: d.TotalVolume,
  }));

  const lineData = [
    {
      id: "On-Time %",
      data: rows.map((d) => ({
        x: d.DeliveryDay,
        y: d.OnTimePercentage,
      })),
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 500 }}>
        <div className="relative w-full h-full">
          {/* Bars (Volume Delivered) */}
          <ResponsiveBar
            data={barData}
            keys={["volume"]}
            indexBy="day"
            margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
            padding={0.3}
            axisBottom={{
              tickRotation: -45,
            }}
            axisLeft={{
              legend: "Total Volume",
              legendPosition: "middle",
              legendOffset: -50,
            }}
            enableLabel={false}
            colors={() => "#2563eb"}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            enableGridX={false}
            enableGridY={false}
          />

          {/* Overlay line chart for On-Time % */}
          <div className="absolute inset-0 pointer-events-none">
            <ResponsiveLine
              data={lineData}
              margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: 0,
                max: 100,
                stacked: false,
              }}
              axisLeft={null}
              axisRight={{
                legend: "On-Time Delivery (%)",
                legendPosition: "middle",
                legendOffset: 50,
              }}
              axisBottom={null}
              colors={{ scheme: "set1" }}
              pointSize={6}
              enablePoints={true}
              useMesh={true}
              enableGridX={false}
              enableGridY={false}
              tooltip={({ point }) => (
                <div
                  style={{
                    background: "white",
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  {point.data.xFormatted}: <strong>{point.data.yFormatted}%</strong>
                </div>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
