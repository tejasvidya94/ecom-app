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

    let groupBy = "DATE(visitedAt)";
    if (bucket === "week") groupBy = "YEARWEEK(visitedAt)";
    if (bucket === "month") groupBy = "DATE_FORMAT(visitedAt, '%Y-%m')";

    const data = await prisma.$queryRawUnsafe<any[]>(`
      SELECT ${groupBy} as bucket, COUNT(*) as visitors
      FROM VisitorLog
      WHERE visitedAt BETWEEN '${startDate.toISOString().slice(0, 10)}'
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
