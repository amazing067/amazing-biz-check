import { promises as fs } from "fs";
import path from "path";

export const TV_PUBLIC_PROPOSAL_FILE = "tv-public-proposal.png";
export const TV_PUBLIC_PDF_FILE = "tv-public-monthly.pdf";
export const TV_PUBLIC_META_FILE = "tv-public-meta.json";

export type TvPublicMeta = { rev: number; proposal: boolean; pdf: boolean };

export function getTvPublicDocsDir(): string {
  return path.join(process.cwd(), "public", "docs");
}

export async function readTvPublicMeta(): Promise<TvPublicMeta> {
  const p = path.join(getTvPublicDocsDir(), TV_PUBLIC_META_FILE);
  try {
    const t = await fs.readFile(p, "utf8");
    const j = JSON.parse(t) as Record<string, unknown>;
    return {
      rev: Number(j.rev) || 0,
      proposal: Boolean(j.proposal),
      pdf: Boolean(j.pdf),
    };
  } catch {
    return { rev: 0, proposal: false, pdf: false };
  }
}

export async function writeTvPublicMeta(m: TvPublicMeta): Promise<void> {
  const dir = getTvPublicDocsDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, TV_PUBLIC_META_FILE),
    JSON.stringify(m, null, 0),
    "utf8",
  );
}

export function getTvPublicUploadPassword(): string {
  const v = process.env.TV_PUBLIC_UPLOAD_PASSWORD?.trim();
  return v || "amazing1234";
}

export function isPngBuffer(buf: Buffer): boolean {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  );
}

export function isPdfBuffer(buf: Buffer): boolean {
  const s = buf.subarray(0, Math.min(5, buf.length)).toString("ascii");
  return s.startsWith("%PDF");
}
