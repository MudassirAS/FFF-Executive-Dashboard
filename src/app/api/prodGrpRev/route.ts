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
        SELECT jd.ProductGroup, SUM(jd.QtySold * jd.UnitPrice) AS Revenue
        FROM jobDetail jd
        JOIN jobHeader jh ON jd.JobId = jh.JobId 
        WHERE jh.completedAt BETWEEN @startDate AND @endDate
        GROUP BY jd.ProductGroup
        ORDER BY Revenue DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching product group revenue:", error);
    return NextResponse.json(
      { error: "Failed to fetch product group revenue" },
      { status: 500 }
    );
  }
}
