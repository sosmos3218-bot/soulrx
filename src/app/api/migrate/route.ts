import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

type MigrateHistory = {
  id: string;
  date: string;
  emotion: string;
  situation: string;
  verseRef: string;
  savedAt: string;
};

type MigrateDaily = {
  date: string;
  count: number;
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { history?: MigrateHistory[]; daily?: MigrateDaily | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const history = body.history ?? [];
  const daily = body.daily ?? null;
  const sql = getSql();
  let migratedHistory = 0;

  for (const e of history) {
    if (!e.id || !e.date || !e.emotion || !e.situation || !e.verseRef) continue;
    const savedAt = e.savedAt || new Date().toISOString();
    await sql`
      INSERT INTO history_entries (id, user_id, date, emotion, situation, verse_ref, saved_at)
      VALUES (${e.id}, ${userId}, ${e.date}, ${e.emotion}, ${e.situation}, ${e.verseRef}, ${savedAt}::timestamptz)
      ON CONFLICT (id) DO NOTHING
    `;
    migratedHistory += 1;
  }

  let migratedDaily = false;
  if (daily && typeof daily.count === "number" && daily.date) {
    await sql`
      INSERT INTO daily_limits (user_id, date, count)
      VALUES (${userId}, ${daily.date}, ${daily.count})
      ON CONFLICT (user_id, date)
      DO UPDATE SET count = GREATEST(daily_limits.count, EXCLUDED.count)
    `;
    migratedDaily = true;
  }

  return NextResponse.json({ migratedHistory, migratedDaily });
}
