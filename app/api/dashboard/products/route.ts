import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : new Date("2025-01-01");
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date();
    const bucket = searchParams.get("bucket") || "day";

    // Decide grouping expression based on bucket
    let groupBy = "DATE(trendDate)";
    if (bucket === "week") groupBy = "YEARWEEK(trendDate)";
    if (bucket === "month") groupBy = "DATE_FORMAT(trendDate, '%Y-%m')";

    // Use raw query for grouping
    const data = await prisma.$queryRawUnsafe<any[]>(`
      SELECT ${groupBy} as bucket, SUM(totalCount) as total
      FROM ProductTrend
      WHERE trendDate BETWEEN '${startDate.toISOString().slice(0, 10)}'
                          AND '${endDate.toISOString().slice(0, 10)}'
      GROUP BY bucket
      ORDER BY bucket ASC
    `);

    return NextResponse.json({
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      bucket,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
