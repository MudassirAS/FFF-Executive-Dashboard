"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";

type VehicleLoadRow = {
  AvgVehicleLoadUtilisation: number | null;
};

export default function AvgVehicleLoadKPI({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [avgLoad, setAvgLoad] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/vehicleLoad?startDate=${startDate}&endDate=${endDate}`
        );
        const rows: VehicleLoadRow[] = await res.json();

        if (!rows || rows.length === 0 || rows[0].AvgVehicleLoadUtilisation === null) {
          setAvgLoad(0);
          return;
        }

        setAvgLoad(Number(rows[0].AvgVehicleLoadUtilisation.toFixed(2)));
      } catch (error) {
        console.error("Error fetching Avg Vehicle Load Utilisation:", error);
        setAvgLoad(0);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Avg Vehicle Load Utilisation %
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {avgLoad !== null ? (
          <p className="text-4xl font-bold text-emerald-600">
            {avgLoad}%
          </p>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}
