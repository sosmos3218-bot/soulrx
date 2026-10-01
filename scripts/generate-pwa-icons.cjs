#!/usr/bin/env node
/** Download PWA icons if missing (e.g. fresh clone). Icons already on production. */
const fs = require("fs");
const path = require("path");
const https = require("https");

const outDir = path.join(__dirname, "..", "public", "icons");
const names = [
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-192.png",
  "icon-maskable-512.png",
];

function fetchBuf(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuf(res.headers.location).then(resolve, reject);
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const name of names) {
    const dest = path.join(outDir, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
      console.log("keep", name);
      continue;
    }
    const url = "https://soulrx.vercel.app/icons/" + name;
    const buf = await fetchBuf(url);
    fs.writeFileSync(dest, buf);
    console.log("fetched", name, buf.length);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
