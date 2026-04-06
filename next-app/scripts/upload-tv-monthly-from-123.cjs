/**
 * public/docs/123.pdf → Supabase Storage tv-public/assets/tv-public-monthly.pdf
 * Usage (from repo root): node next-app/scripts/upload-tv-monthly-from-123.cjs
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const BUCKET = "tv-public";
const OBJECT = "assets/tv-public-monthly.pdf";

function loadEnvLocal(dir) {
  const p = path.join(dir, ".env.local");
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

const nextApp = path.join(__dirname, "..");
const repoRoot = path.join(nextApp, "..");
const env = { ...loadEnvLocal(nextApp), ...loadEnvLocal(repoRoot) };
const url = env.SUPABASE_URL || process.env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const candidates = [
  path.join(repoRoot, "public", "docs", "123.pdf"),
  path.join(nextApp, "public", "docs", "123.pdf"),
];

const filePath = candidates.find((p) => fs.existsSync(p));
if (!filePath) {
  console.error("123.pdf not found under public/docs");
  process.exit(1);
}

if (!url || !key) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required (.env.local in next-app or repo root)");
  process.exit(1);
}

const buf = fs.readFileSync(filePath);
if (!buf.subarray(0, 5).toString("ascii").startsWith("%PDF")) {
  console.error("File is not PDF");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  await supabase.storage.createBucket(BUCKET, { public: false }).catch(() => {});
  const { error } = await supabase.storage.from(BUCKET).upload(OBJECT, buf, {
    upsert: true,
    contentType: "application/pdf",
  });
  if (error) {
    console.error("Upload failed:", error.message || error);
    process.exit(1);
  }
  console.log("Uploaded", OBJECT, "from", filePath, "(" + buf.length + " bytes)");
})();
