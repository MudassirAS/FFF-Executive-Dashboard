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
        SELECT jd.jobId, QtySold*UnitPrice AS Revenue
        FROM jobHeader jh
        JOIN jobDetail jd ON jh.jobId = jd.jobId
        WHERE jh.completedAt BETWEEN @startDate AND @endDate
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching jobHeader:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobHeader" },
      { status: 500 }
    );
  }
}
