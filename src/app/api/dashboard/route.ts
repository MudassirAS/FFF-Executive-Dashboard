// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import sql from "mssql";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate query params are required" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // JobDates (On-time KPI) - keep same logic as your original route (no typed conversion)
    const jobDatesPromise = pool
      .request()
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

    // Orders heatmap (same as original)
    const ordersHeatmapPromise = pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .query(`
        SELECT jh.CustomerLongitude, jh.CustomerLatitude, jd.QtySold
        FROM jobHeader jh
        JOIN jobDetail jd ON jd.JobId = jh.JobId
        WHERE (jh.completedAt BETWEEN @startDate AND @endDate)
          AND (jd.Deleted <> 1 OR jd.Deleted IS NULL)
      `);

    // Performance over time - this originally used Date types and an exclusive end date
    const start = new Date(startDate);
    const end = new Date(endDate);
    const endExclusive = new Date(end);
    endExclusive.setDate(endExclusive.getDate() + 1);

    const perfOverTimePromise = pool
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

    // Product group revenue (same logic)
    const prodGrpRevPromise = pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .query(`
        SELECT jd.ProductGroup, SUM(jd.QtySold * jd.UnitPrice) AS Revenue
        FROM jobDetail jd
        JOIN jobHeader jh ON jd.JobId = jh.JobId 
        WHERE jh.completedAt BETWEEN @startDate AND @endDate AND
          jd.Deleted IS NULL
        GROUP BY jd.ProductGroup
        ORDER BY Revenue DESC
      `);

    // Top 10 customers - produce both metrics (volume and revenue) so the client can switch locally
    const top10VolumePromise = pool
      .request()
      .input("startDate", sql.DateTime, start)
      .input("endDate", sql.DateTime, endExclusive)
      .query(`
        SELECT TOP 10
          jh.customerId,
          jh.CustomerName,
          SUM(ISNULL(jd.QtySold,0)) AS TotalVolume
        FROM jobHeader jh
        JOIN jobDetail jd ON jh.jobId = jd.jobId
        WHERE (jh.completedAt BETWEEN @startDate AND @endDate) AND
          jd.Deleted IS NULL
        GROUP BY jh.customerId, jh.CustomerName
        ORDER BY TotalVolume DESC
      `);

    const top10RevenuePromise = pool
      .request()
      .input("startDate", sql.DateTime, start)
      .input("endDate", sql.DateTime, endExclusive)
      .query(`
        SELECT TOP 10
          jh.customerId,
          jh.CustomerName,
          SUM(ISNULL(jd.QtySold,0) * ISNULL(jd.SellPrice,0)) AS TotalRevenue
        FROM jobHeader jh
        JOIN jobDetail jd ON jh.jobId = jd.jobId
        WHERE (jh.completedAt BETWEEN @startDate AND @endDate) AND
          jd.Deleted IS NULL
        GROUP BY jh.customerId, jh.CustomerName
        ORDER BY TotalRevenue DESC
      `);

    // Total Revenue rows (same as original - client reduces)
    const totalRevenuePromise = pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .query(`
        SELECT jd.jobId, QtySold*UnitPrice AS Revenue
        FROM jobHeader jh
        JOIN jobDetail jd ON jh.jobId = jd.jobId
        WHERE jh.completedAt BETWEEN @startDate AND @endDate AND
          jd.Deleted IS NULL
      `);

    // Total Volume rows (same as original - client reduces)
    const totalVolumePromise = pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .query(`
        SELECT jd.jobId, jd.QtySold
        FROM jobHeader jh
        JOIN jobDetail jd ON jh.jobId = jd.jobId
        WHERE jh.completedAt BETWEEN @startDate AND @endDate AND
          jd.Deleted IS NULL
      `);

    // Vehicle load (same)
    const vehicleLoadPromise = pool
      .request()
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

    const [
      jobDatesRes,
      ordersHeatmapRes,
      perfRes,
      prodGrpRes,
      top10VolRes,
      top10RevRes,
      totalRevenueRes,
      totalVolumeRes,
      vehicleLoadRes,
    ] = await Promise.all([
      jobDatesPromise,
      ordersHeatmapPromise,
      perfOverTimePromise,
      prodGrpRevPromise,
      top10VolumePromise,
      top10RevenuePromise,
      totalRevenuePromise,
      totalVolumePromise,
      vehicleLoadPromise,
    ]);

    return NextResponse.json({
      // jobDates endpoint previously returned { onTimePercentage: <value> }
      jobDates: { onTimePercentage: jobDatesRes.recordset[0]?.OnTimePercentage ?? 0 },

      // the rest return arrays (same shape as before)
      ordersHeatmap: ordersHeatmapRes.recordset,
      perfOverTime: perfRes.recordset,
      prodGrpRev: prodGrpRes.recordset,
      top10Volume: top10VolRes.recordset,
      top10Revenue: top10RevRes.recordset,
      totalRevenue: totalRevenueRes.recordset,
      totalVolume: totalVolumeRes.recordset,
      vehicleLoad: vehicleLoadRes.recordset,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
