// src/app/api/performanceOverTime/route.ts
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import sql from "mssql";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: "startDate and endDate query params are required" },
        { status: 400 }
      );
    }

    // parse dates (treat endDate inclusive; we'll convert to exclusive upper bound)
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const endExclusive = new Date(end);
    endExclusive.setDate(endExclusive.getDate() + 1); // make end exclusive

    const pool = await getConnection();

    // Use parameterized inputs with correct types
    const result = await pool
      .request()
      .input("startDate", sql.DateTime, start)
      .input("endDate", sql.DateTime, endExclusive)
      .query(`
        WITH DailyJobs AS (
          SELECT
            CONVERT(date, jh.completedAt) AS DeliveryDay,
            ISNULL(jd.QtySold, 0) AS QtySold,
            jh.completedAt,
            jh.LatestDeliveryDate
          FROM jobHeader jh
          JOIN jobDetail jd ON jh.jobId = jd.jobId
          WHERE jh.completedAt BETWEEN @startDate AND @endDate AND
            jd.Deleted IS NULL
        )
        SELECT
          CONVERT(varchar(10), DeliveryDay, 23) AS DeliveryDay, -- yyyy-mm-dd
          SUM(QtySold) AS TotalVolume,
          CASE WHEN COUNT(*) = 0 THEN 0
            ELSE CAST(SUM(CASE WHEN completedAt <= LatestDeliveryDate THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100
          END AS OnTimePercentage
        FROM DailyJobs
        GROUP BY DeliveryDay
        ORDER BY DeliveryDay;
      `);

    // return an array of rows: [{ DeliveryDay, TotalVolume, OnTimePercentage }, ...]
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching performance over time:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}
