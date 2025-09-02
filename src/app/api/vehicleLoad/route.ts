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
        SELECT 
        AVG(CAST(TotalVolume AS FLOAT) / NULLIF(CAST(VehicleMaxVolume AS FLOAT), 0) * 100) 
        AS AvgVehicleLoadUtilisation
        FROM jobRunData
        WHERE RunDate IS NOT NULL AND
          RunDate BETWEEN @startDate AND @endDate;
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching jobRunData:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobRunData" },
      { status: 500 }
    );
  }
}
