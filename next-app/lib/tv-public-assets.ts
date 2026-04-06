export const TV_PUBLIC_PROPOSAL_FILE = "tv-public-proposal.png";
export const TV_PUBLIC_PDF_FILE = "tv-public-monthly.pdf";
export const TV_PUBLIC_META_FILE = "tv-public-meta.json";
export const TV_PUBLIC_STORAGE_BUCKET = "tv-public";
export const TV_PUBLIC_STORAGE_PREFIX = "assets";

export type TvPublicMeta = { rev: number; proposal: boolean; pdf: boolean };

export function getTvPublicStorageProposalPath(): string {
  return `${TV_PUBLIC_STORAGE_PREFIX}/${TV_PUBLIC_PROPOSAL_FILE}`;
}

export function getTvPublicStoragePdfPath(): string {
  return `${TV_PUBLIC_STORAGE_PREFIX}/${TV_PUBLIC_PDF_FILE}`;
}

export async function readTvPublicMeta(): Promise<TvPublicMeta> {
  return { rev: 0, proposal: false, pdf: false };
}

export async function writeTvPublicMeta(_: TvPublicMeta): Promise<void> {
  // Supabase Storage 기반으로 전환되어 메타 파일은 사용하지 않는다.
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
