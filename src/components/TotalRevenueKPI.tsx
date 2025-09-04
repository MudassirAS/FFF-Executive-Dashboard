// src/components/TotalRevenueKPI.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type JobRevenue = {
  jobId: number;
  Revenue: number;
};

export default function TotalRevenueKPI({
  data,
}: {
  data?: JobRevenue[] | null;
}) {
  // Loading while parent fetches
  if (data === undefined) {
    return (
      <Card className="w-full max-w-sm mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-2">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const jobs = data ?? [];

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return (
      <Card className="w-full max-w-sm mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-2">
          <p className="text-4xl font-bold text-purple-600">$0</p>
        </CardContent>
      </Card>
    );
  }

  const total = jobs.reduce((sum, job) => sum + (Number(job.Revenue) || 0), 0);

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Total Revenue</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-2">
        <p className="text-4xl font-bold text-purple-600">
          ${total.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </CardContent>
    </Card>
  );
}
