// src/app/api/ordersHeatmap/route.ts
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
        SELECT jh.CustomerLongitude, jh.CustomerLatitude, jd.QtySold
        FROM jobHeader jh
        JOIN jobDetail jd ON jd.JobId = jh.JobId
        WHERE (jh.completedAt BETWEEN @startDate AND @endDate)
          AND (jd.Deleted <> 1 OR jd.Deleted IS NULL)
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching orders heatmap:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders heatmap" },
      { status: 500 }
    );
  }
}
