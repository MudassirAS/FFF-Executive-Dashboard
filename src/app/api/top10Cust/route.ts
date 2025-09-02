// src/app/api/top10Cust/route.ts
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import sql from "mssql";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const metric = searchParams.get("metric"); // "volume" | "revenue"

    if (!startDateStr || !endDateStr || !metric) {
      return NextResponse.json(
        { error: "startDate, endDate and metric query params are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const endExclusive = new Date(end);
    endExclusive.setDate(endExclusive.getDate() + 1);

    const pool = await getConnection();

    // Choose the right aggregate column
    const metricColumn =
      metric === "revenue"
        ? "SUM(ISNULL(jd.QtySold,0) * ISNULL(jd.SellPrice,0))"
        : "SUM(ISNULL(jd.QtySold,0))";

    const metricAlias = metric === "revenue" ? "TotalRevenue" : "TotalVolume";

    const query = `
      SELECT TOP 10
        jh.customerId,
        jh.CustomerName,
        ${metricColumn} AS ${metricAlias}
      FROM jobHeader jh
      JOIN jobDetail jd ON jh.jobId = jd.jobId
      WHERE (jh.completedAt BETWEEN @startDate AND @endDate) AND
        jd.Deleted IS NULL
      GROUP BY jh.customerId, jh.CustomerName
      ORDER BY ${metricAlias} DESC
    `;

    const result = await pool
      .request()
      .input("startDate", sql.DateTime, start)
      .input("endDate", sql.DateTime, endExclusive)
      .query(query);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching top 10 customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch top 10 customers" },
      { status: 500 }
    );
  }
}
