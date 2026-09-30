import type { Emotion, Prescription, Situation } from "@/lib/types";
import { anxietyFull } from "./anxiety";
import { sorrowFull } from "./sorrow";
import { wearyFull } from "./weary";
import { gratitudeFull } from "./gratitude";
import { joyFull } from "./joy";
import { angerFull } from "./anger";

export const PRESCRIPTIONS: Prescription[] = [
  ...anxietyFull,
  ...sorrowFull,
  ...wearyFull,
  ...gratitudeFull,
  ...joyFull,
  ...angerFull,
];

export function getPrescription(
  emotion: Emotion,
  situation: Situation
): Prescription | undefined {
  return PRESCRIPTIONS.find(
    (p) => p.emotion === emotion && p.situation === situation
  );
}
