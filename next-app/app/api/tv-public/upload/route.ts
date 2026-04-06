import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  getTvPublicDocsDir,
  getTvPublicUploadPassword,
  isPdfBuffer,
  isPngBuffer,
  readTvPublicMeta,
  TV_PUBLIC_PDF_FILE,
  TV_PUBLIC_PROPOSAL_FILE,
  writeTvPublicMeta,
} from "@/lib/tv-public-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PNG = 25 * 1024 * 1024;
const MAX_PDF = 80 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const password = String(form.get("password") ?? "").trim();
    if (password !== getTvPublicUploadPassword()) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const dir = getTvPublicDocsDir();
    await fs.mkdir(dir, { recursive: true });
    const meta = await readTvPublicMeta();

    const resetProposal = String(form.get("resetProposal") ?? "") === "1";
    const resetPdf = String(form.get("resetPdf") ?? "") === "1";

    if (resetProposal) {
      try {
        await fs.unlink(path.join(dir, TV_PUBLIC_PROPOSAL_FILE));
      } catch {
        /* ignore */
      }
      meta.proposal = false;
      meta.rev = Date.now();
      await writeTvPublicMeta(meta);
    }

    if (resetPdf) {
      try {
        await fs.unlink(path.join(dir, TV_PUBLIC_PDF_FILE));
      } catch {
        /* ignore */
      }
      meta.pdf = false;
      meta.rev = Date.now();
      await writeTvPublicMeta(meta);
    }

    const proposalEntry = form.get("proposal");
    if (proposalEntry instanceof File && proposalEntry.size > 0) {
      if (proposalEntry.size > MAX_PNG) {
        return NextResponse.json({ error: "png-too-large" }, { status: 400 });
      }
      const ab = await proposalEntry.arrayBuffer();
      const buf = Buffer.from(ab);
      if (!isPngBuffer(buf)) {
        return NextResponse.json({ error: "invalid-png" }, { status: 400 });
      }
      await fs.writeFile(path.join(dir, TV_PUBLIC_PROPOSAL_FILE), buf);
      meta.proposal = true;
      meta.rev = Date.now();
      await writeTvPublicMeta(meta);
    }

    const pdfEntry = form.get("pdf");
    if (pdfEntry instanceof File && pdfEntry.size > 0) {
      if (pdfEntry.size > MAX_PDF) {
        return NextResponse.json({ error: "pdf-too-large" }, { status: 400 });
      }
      const ab = await pdfEntry.arrayBuffer();
      const buf = Buffer.from(ab);
      if (!isPdfBuffer(buf)) {
        return NextResponse.json({ error: "invalid-pdf" }, { status: 400 });
      }
      await fs.writeFile(path.join(dir, TV_PUBLIC_PDF_FILE), buf);
      meta.pdf = true;
      meta.rev = Date.now();
      await writeTvPublicMeta(meta);
    }

    const fresh = await readTvPublicMeta();
    return NextResponse.json({ ok: true, meta: fresh });
  } catch (e) {
    console.error("tv-public upload POST", e);
    return NextResponse.json({ error: "upload-failed" }, { status: 500 });
  }
}
