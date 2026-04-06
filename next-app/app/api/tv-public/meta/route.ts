import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  getTvPublicDocsDir,
  readTvPublicMeta,
  TV_PUBLIC_PROPOSAL_FILE,
  TV_PUBLIC_PDF_FILE,
} from "@/lib/tv-public-assets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const meta = await readTvPublicMeta();
    const dir = getTvPublicDocsDir();
    let proposal = meta.proposal;
    let pdf = meta.pdf;
    try {
      await fs.access(path.join(dir, TV_PUBLIC_PROPOSAL_FILE));
    } catch {
      proposal = false;
    }
    try {
      await fs.access(path.join(dir, TV_PUBLIC_PDF_FILE));
    } catch {
      pdf = false;
    }
    const merged = { ...meta, proposal, pdf };
    return NextResponse.json(merged, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (e) {
    console.error("tv-public meta GET", e);
    return NextResponse.json(
      { rev: 0, proposal: false, pdf: false },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
