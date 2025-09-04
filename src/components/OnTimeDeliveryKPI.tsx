// src/components/OnTimeDeliveryKPI.tsx
"use client";

import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";

export default function OnTimeDeliveryKPI({
  data,
}: {
  data?: { onTimePercentage?: number } | null;
}) {
  // Loading while parent fetches
  if (data === undefined) {
    return (
      <Card className="w-full max-w-sm mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            On-Time Delivery %
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const onTimePercentage =
    data && typeof data.onTimePercentage === "number"
      ? Number(data.onTimePercentage.toFixed(2))
      : 0;

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">On-Time Delivery %</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <p className="text-4xl font-bold text-green-600">{onTimePercentage}%</p>
      </CardContent>
    </Card>
  );
}
