// src/components/TotalVolumeKPI.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type JobVolume = {
  jobId: number;
  QtySold: number;
};

export default function TotalVolumeKPI({
  data,
}: {
  data?: JobVolume[] | null;
}) {
  if (data === undefined) {
    return (
      <Card className="w-full max-w-sm mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Total Volume</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-2">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const jobs = data ?? [];

  if (jobs.length === 0) {
    return (
      <Card className="w-full max-w-sm mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Total Volume</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-2">
          <p className="text-4xl font-bold text-blue-600">0 litres</p>
        </CardContent>
      </Card>
    );
  }

  const total = jobs.reduce((sum, job) => sum + Number(job.QtySold || 0), 0);

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Total Volume</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-2">
        <p className="text-4xl font-bold text-blue-600">
          {total.toLocaleString()} litres
        </p>
      </CardContent>
    </Card>
  );
}
