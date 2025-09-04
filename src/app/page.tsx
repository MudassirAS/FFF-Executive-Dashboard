// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import OnTimeDeliveryKPI from "@/components/OnTimeDeliveryKPI";
import TotalVolumeKPI from "@/components/TotalVolumeKPI";
import TotalRevenueKPI from "@/components/TotalRevenueKPI";
import AvgLoadUtilisationKPI from "@/components/AvgVehicleLoadKPI";
import PerfOverTimeChart from "@/components/perfOverTimeChart";
import Top10CustomersChart from "@/components/Top10CustomersChart";
import ProdGrpRevChart from "@/components/ProdGrpRevChart";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Disable SSR for Leaflet heatmap (leaflet touches window)
const OrdersHeatmap = dynamic(() => import("@/components/OrdersHeatmap"), {
  ssr: false,
});

/**
 * Types that match your consolidated /api/dashboard response
 */
type JobDatesSlice = { onTimePercentage?: number } | null;

type HeatmapRow = {
  CustomerLongitude: number | null;
  CustomerLatitude: number | null;
  QtySold: number | null;
};

type PerformanceRow = {
  DeliveryDay: string;
  TotalVolume: number;
  OnTimePercentage: number;
};

type ProdGrpRow = {
  ProductGroup: string;
  Revenue: number;
};

type Top10VolumeRow = {
  customerId: string;
  CustomerName: string;
  TotalVolume: number;
};

type Top10RevenueRow = {
  customerId: string;
  CustomerName: string;
  TotalRevenue: number;
};

type JobRevenueRow = {
  jobId: number;
  Revenue: number;
};

type JobVolumeRow = {
  jobId: number;
  QtySold: number;
};

type VehicleLoadRow = {
  AvgVehicleLoadUtilisation: number | null;
};

/**
 * Full dashboard payload type (must mirror /api/dashboard)
 */
type DashboardPayload = {
  jobDates: JobDatesSlice;
  ordersHeatmap: HeatmapRow[] | null;
  perfOverTime: PerformanceRow[] | null;
  prodGrpRev: ProdGrpRow[] | null;
  top10Volume: Top10VolumeRow[] | null;
  top10Revenue: Top10RevenueRow[] | null;
  totalRevenue: JobRevenueRow[] | null;
  totalVolume: JobVolumeRow[] | null;
  vehicleLoad: VehicleLoadRow[] | null;
};

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState<string>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<string>(today);
  const [range, setRange] = useState<"7D" | "30D" | "90D" | "CUSTOM">("30D");

  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // fetch the single consolidated dashboard payload
  useEffect(() => {
    let mounted = true;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await fetch(`/api/dashboard?startDate=${startDate}&endDate=${endDate}`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Dashboard request failed: ${txt || res.statusText}`);
        }
        // typed assertion to DashboardPayload (no `any`)
        const json = (await res.json()) as DashboardPayload;
        if (!mounted) return;
        setDashboardData(json);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to fetch dashboard data:", err);
        setDashboardData(null);
        setErrorMessage((err as Error).message ?? "Unknown error fetching dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, [startDate, endDate]);

  const handleRangeClick = (days: number, label: "7D" | "30D" | "90D") => {
    const newStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setStartDate(newStart);
    setEndDate(today);
    setRange(label);
  };

  // While loading show top-level loader (components themselves show Loading when they receive undefined)
  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (errorMessage) {
    return (
      <div className="p-6">
        <div className="text-red-600 font-medium">Error: {errorMessage}</div>
      </div>
    );
  }

  // Pass slices safely using optional chaining so child components receive `undefined` while parent hasn't provided data
  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              disabled={range !== "CUSTOM"}
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
              disabled={range !== "CUSTOM"}
            />
          </div>
        </div>

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
          <Button
            variant={range === "CUSTOM" ? "default" : "outline"}
            onClick={() => setRange("CUSTOM")}
          >
            Custom
          </Button>
        </div>
      </div>

      {/* Headline KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Headline KPIs</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <OnTimeDeliveryKPI data={dashboardData?.jobDates ?? undefined} />
            <TotalVolumeKPI data={dashboardData?.totalVolume ?? undefined} />
            <TotalRevenueKPI data={dashboardData?.totalRevenue ?? undefined} />
            <AvgLoadUtilisationKPI data={dashboardData?.vehicleLoad ?? undefined} />
          </div>
        </CardContent>
      </Card>

      {/* Performance Over Time */}
      <PerfOverTimeChart data={dashboardData?.perfOverTime ?? undefined} />

      {/* Side-by-side charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Top10CustomersChart
          top10Volume={dashboardData?.top10Volume ?? undefined}
          top10Revenue={dashboardData?.top10Revenue ?? undefined}
        />
        <ProdGrpRevChart data={dashboardData?.prodGrpRev ?? undefined} />
      </div>

      {/* Heatmap */}
      <h1>Order Density Heatmap:</h1>
      <OrdersHeatmap data={dashboardData?.ordersHeatmap ?? undefined} />
    </div>
  );
}
