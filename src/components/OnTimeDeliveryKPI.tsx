"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";

export default function OnTimeDeliveryKPI({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [onTimePercentage, setOnTimePercentage] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        `/api/jobDates?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();

      if (res.ok) {
        setOnTimePercentage(Number(data.onTimePercentage?.toFixed(2)));
      } else {
        setOnTimePercentage(0);
      }
    }
    fetchData();
  }, [startDate, endDate]);

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          On-Time Delivery %
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {onTimePercentage !== null ? (
          <p className="text-4xl font-bold text-green-600">
            {onTimePercentage}%
          </p>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}
