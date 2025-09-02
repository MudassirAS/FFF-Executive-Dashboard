"use client";

import { useState } from "react";
import OnTimeDeliveryKPI from "@/components/OnTimeDeliveryKPI";
import TotalVolumeKPI from "@/components/TotalVolumeKPI";
import { Input } from "@/components/ui/input";
import TotalRevenueKPI from "@/components/TotalRevenueKPI";
import AvgLoadUtilisationKPI from "@/components/AvgVehicleLoadKPI";
import PerfOverTimeChart from "@/components/perfOverTimeChart";
import Top10CustomersChart from "@/components/Top10CustomersChart";
import ProdGrpRevChart from "@/components/ProdGrpRevChart";
import { Button } from "@/components/ui/button";

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [range, setRange] = useState<"7D" | "30D" | "90D" | "CUSTOM">("30D");

  const handleRangeClick = (days: number, label: "7D" | "30D" | "90D") => {
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setStartDate(start);
    setEndDate(today);
    setRange(label);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Date Inputs */}
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setRange("CUSTOM");
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setRange("CUSTOM");
              }}
            />
          </div>
        </div>

        {/* Quick Range Selector */}
        <div className="flex gap-2">
          <Button
            variant={range === "7D" ? "default" : "outline"}
            onClick={() => handleRangeClick(7, "7D")}
          >
            7D
          </Button>
          <Button
            variant={range === "30D" ? "default" : "outline"}
            onClick={() => handleRangeClick(30, "30D")}
          >
            30D
          </Button>
          <Button
            variant={range === "90D" ? "default" : "outline"}
            onClick={() => handleRangeClick(90, "90D")}
          >
            90D
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <h1>Headline KPIs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <OnTimeDeliveryKPI startDate={startDate} endDate={endDate} />
        <TotalVolumeKPI startDate={startDate} endDate={endDate} />
        <TotalRevenueKPI startDate={startDate} endDate={endDate} />
        <AvgLoadUtilisationKPI startDate={startDate} endDate={endDate} />
      </div>

      <PerfOverTimeChart startDate={startDate} endDate={endDate} />
      <Top10CustomersChart startDate={startDate} endDate={endDate} />
      <ProdGrpRevChart startDate={startDate} endDate={endDate} />
    </div>
  );
}
