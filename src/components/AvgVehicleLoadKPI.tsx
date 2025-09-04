"use client";

import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";

type VehicleLoadRow = {
  AvgVehicleLoadUtilisation: number | null;
};

export default function AvgVehicleLoadKPI({
  data,
}: {
  data?: VehicleLoadRow[] | null;
}) {
  // while parent is fetching, data will be undefined -> show loading
  if (data === undefined) {
    return (
      <Card className="w-full max-w-sm mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Avg Vehicle Load Utilisation %
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  // compute value deterministically (no hooks called conditionally)
  let avgLoad = 0;
  if (Array.isArray(data) && data.length > 0) {
    const val = data[0].AvgVehicleLoadUtilisation;
    if (val !== null && typeof val === "number" && !Number.isNaN(val)) {
      avgLoad = Number(val.toFixed(2));
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Avg Vehicle Load Utilisation %
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <p className="text-4xl font-bold text-emerald-600">{avgLoad}%</p>
      </CardContent>
    </Card>
  );
}
