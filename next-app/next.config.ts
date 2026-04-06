import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// next.config.ts가 있는 폴더의 .env.local을 직접 읽어서 env에 주입 (Turbopack root 이슈 회피)
function loadEnvLocal(dir: string): Record<string, string> {
  const file = path.join(dir, ".env.local");
  const out: Record<string, string> = {};
  try {
    if (!fs.existsSync(file)) return out;
    const text = fs.readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (key) out[key] = val;
    }
  } catch (_) {}
  return out;
}

const envLocal = loadEnvLocal(__dirname);

const nextConfig: NextConfig = {
  env: {
    SUPABASE_URL: envLocal.SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    SUPABASE_SERVICE_ROLE_KEY: envLocal.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  },
  // TV 공용 PDF 업로드(최대 80MB) 등 대용량 multipart 수신 — 기본 10MB 초과 시 본문이 잘림
  experimental: {
    proxyClientMaxBodySize: "90mb",
  },
  // 빌드/개발 시 next 패키지가 있는 디렉터리를 루트로 고정 (app이 아닌 next-app)
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
