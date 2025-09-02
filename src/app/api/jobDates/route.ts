import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const pool = await getConnection();

    const result = await pool.request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .query(`
        WITH CompletedJobs AS (
          SELECT jobId, completedAt, LatestDeliveryDate
          FROM jobHeader
          WHERE completedAt IS NOT NULL
            AND completedAt BETWEEN @startDate AND @endDate
        )
        SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE CAST(SUM(CASE WHEN completedAt <= LatestDeliveryDate THEN 1 ELSE 0 END) AS FLOAT) 
                 / COUNT(*) * 100 
          END AS OnTimePercentage
        FROM CompletedJobs
      `);

    return NextResponse.json({ onTimePercentage: result.recordset[0].OnTimePercentage });
  } catch (error) {
    console.error("Error fetching jobHeader:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI" },
      { status: 500 }
    );
  }
}
