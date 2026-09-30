import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { seoulDate } from "@/lib/date";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = seoulDate();
  const sql = getSql();
  const rows = await sql`
    SELECT date, count
    FROM daily_limits
    WHERE user_id = ${userId} AND date = ${today}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ date: today, count: 0 });
  }

  return NextResponse.json({
    date: String(rows[0].date).slice(0, 10),
    count: Number(rows[0].count),
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let incrementBy = 1;
  let date = seoulDate();
  let absoluteCount: number | null = null;

  try {
    const body = (await req.json()) as {
      increment?: number;
      date?: string;
      count?: number;
    };
    if (typeof body.increment === "number") incrementBy = body.increment;
    if (typeof body.date === "string") date = body.date;
    if (typeof body.count === "number") absoluteCount = body.count;
  } catch {
    // empty body is fine — default increment 1 for today
  }

  const sql = getSql();

  if (absoluteCount !== null) {
    await sql`
      INSERT INTO daily_limits (user_id, date, count)
      VALUES (${userId}, ${date}, ${absoluteCount})
      ON CONFLICT (user_id, date)
      DO UPDATE SET count = GREATEST(daily_limits.count, EXCLUDED.count)
    `;
    const rows = await sql`
      SELECT date, count
      FROM daily_limits
      WHERE user_id = ${userId} AND date = ${date}
      LIMIT 1
    `;
    return NextResponse.json({
      date: String(rows[0].date).slice(0, 10),
      count: Number(rows[0].count),
    });
  }

  await sql`
    INSERT INTO daily_limits (user_id, date, count)
    VALUES (${userId}, ${date}, ${incrementBy})
    ON CONFLICT (user_id, date)
    DO UPDATE SET count = daily_limits.count + ${incrementBy}
  `;

  const rows = await sql`
    SELECT date, count
    FROM daily_limits
    WHERE user_id = ${userId} AND date = ${date}
    LIMIT 1
  `;

  return NextResponse.json({
    date: String(rows[0].date).slice(0, 10),
    count: Number(rows[0].count),
  });
}
