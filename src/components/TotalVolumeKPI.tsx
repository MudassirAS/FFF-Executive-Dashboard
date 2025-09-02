"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type JobVolume = {
  jobId: number;
  QtySold: number;
};

export default function TotalVolumeKPI({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [totalVolume, setTotalVolume] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        `/api/totalVolume?startDate=${startDate}&endDate=${endDate}`
      );
      const jobs: JobVolume[] = await res.json();

      if (jobs.length === 0) {
        setTotalVolume(0);
        return;
      }

      const total = jobs.reduce((sum, job) => sum + job.QtySold, 0);
      setTotalVolume(total);
    }

    fetchData();
  }, [startDate, endDate]);

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Total Volume</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-2">
        {totalVolume !== null ? (
          <p className="text-4xl font-bold text-blue-600">
            {totalVolume.toLocaleString()} litres
          </p>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}
