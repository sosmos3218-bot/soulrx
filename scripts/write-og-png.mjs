#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partsDir = path.join(__dirname, "og-parts");
const out = path.join(__dirname, "..", "public", "og.png");

// Prefer an already-committed real PNG (do not overwrite).
if (fs.existsSync(out)) {
  const existing = fs.readFileSync(out);
  if (existing[0] === 0x89 && existing[1] === 0x50) {
    console.log("public/og.png already present", existing.length);
    process.exit(0);
  }
}

if (!fs.existsSync(partsDir)) {
  console.error("No og-parts dir and no valid public/og.png");
  process.exit(1);
}

const files = fs
  .readdirSync(partsDir)
  .filter((f) => f.endsWith(".b64"))
  .sort();
if (files.length === 0) {
  console.error("No og-parts found");
  process.exit(1);
}
const b64 = files.map((f) => fs.readFileSync(path.join(partsDir, f), "utf8").trim()).join("");
const buf = Buffer.from(b64, "base64");
if (buf[0] !== 0x89 || buf[1] !== 0x50) {
  console.error("Decoded output is not a PNG");
  process.exit(1);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
console.log("wrote", out, buf.length, "from", files.length, "parts");
