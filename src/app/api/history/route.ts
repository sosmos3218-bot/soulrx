import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { seoulDate } from "@/lib/date";
import type { Emotion, Situation } from "@/lib/types";

function last7SeoulDates(): string[] {
  const today = seoulDate();
  const [y, m, d] = today.split("-").map(Number);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d - i));
    dates.push(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dt)
    );
  }
  return dates;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getSql();
  const dates = last7SeoulDates();
  const rows = await sql`
    SELECT id, date, emotion, situation, verse_ref AS "verseRef",
           saved_at AS "savedAt"
    FROM history_entries
    WHERE user_id = ${userId}
      AND date = ANY(${dates})
    ORDER BY saved_at DESC
    LIMIT 50
  `;

  const entries = rows.map((r) => ({
    id: String(r.id),
    date: String(r.date).slice(0, 10),
    emotion: r.emotion as Emotion,
    situation: r.situation as Situation,
    verseRef: String(r.verseRef),
    savedAt:
      r.savedAt instanceof Date
        ? r.savedAt.toISOString()
        : String(r.savedAt),
  }));

  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    emotion?: string;
    situation?: string;
    verseRef?: string;
    date?: string;
    savedAt?: string;
    id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { emotion, situation, verseRef } = body;
  if (!emotion || !situation || !verseRef) {
    return NextResponse.json(
      { error: "emotion, situation, verseRef required" },
      { status: 400 }
    );
  }

  const id =
    body.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const date = body.date ?? seoulDate();
  const savedAt = body.savedAt ?? new Date().toISOString();

  const sql = getSql();
  await sql`
    INSERT INTO history_entries (id, user_id, date, emotion, situation, verse_ref, saved_at)
    VALUES (${id}, ${userId}, ${date}, ${emotion}, ${situation}, ${verseRef}, ${savedAt}::timestamptz)
    ON CONFLICT (id) DO NOTHING
  `;

  return NextResponse.json({
    entry: {
      id,
      date,
      emotion,
      situation,
      verseRef,
      savedAt,
    },
  });
}
