"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type JobRevenue = {
  jobId: number;
  Revenue: number;
};

export default function TotalRevenueKPI({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/totalRevenue?startDate=${startDate}&endDate=${endDate}`
        );
        const jobs: JobRevenue[] = await res.json();

        if (!Array.isArray(jobs) || jobs.length === 0) {
          setTotalRevenue(0);
          return;
        }

        const total = jobs.reduce(
          (sum, job) => sum + (Number(job.Revenue) || 0),
          0
        );

        setTotalRevenue(total);
      } catch (err) {
        console.error("Failed to fetch revenue:", err);
        setTotalRevenue(0);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Total Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-2">
        {totalRevenue !== null ? (
          <p className="text-4xl font-bold text-purple-600">
            {totalRevenue.toLocaleString()}
          </p>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}
