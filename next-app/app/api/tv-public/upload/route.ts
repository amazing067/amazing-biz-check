import { NextRequest, NextResponse } from "next/server";
import {
  getTvPublicStoragePdfPath,
  getTvPublicStorageProposalPath,
  getTvPublicUploadPassword,
  isPdfBuffer,
  isPngBuffer,
  TV_PUBLIC_STORAGE_BUCKET,
} from "@/lib/tv-public-assets";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PNG = 25 * 1024 * 1024;
const MAX_PDF = 80 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "supabase-not-configured" }, { status: 503 });
    }

    const form = await req.formData();
    const password = String(form.get("password") ?? "").trim();
    if (password !== getTvPublicUploadPassword()) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const proposalPath = getTvPublicStorageProposalPath();
    const pdfPath = getTvPublicStoragePdfPath();

    // 버킷이 없는 환경 대비: 있으면 무시
    await supabase.storage.createBucket(TV_PUBLIC_STORAGE_BUCKET, { public: false }).catch(() => {});

    const resetProposal = String(form.get("resetProposal") ?? "") === "1";
    const resetPdf = String(form.get("resetPdf") ?? "") === "1";

    if (resetProposal) {
      await supabase.storage.from(TV_PUBLIC_STORAGE_BUCKET).remove([proposalPath]);
    }

    if (resetPdf) {
      await supabase.storage.from(TV_PUBLIC_STORAGE_BUCKET).remove([pdfPath]);
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
      const up = await supabase.storage.from(TV_PUBLIC_STORAGE_BUCKET).upload(proposalPath, buf, {
        upsert: true,
        contentType: "image/png",
      });
      if (up.error) {
        console.error("tv-public proposal upload error", up.error);
        return NextResponse.json({ error: "upload-failed" }, { status: 500 });
      }
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
      const up = await supabase.storage.from(TV_PUBLIC_STORAGE_BUCKET).upload(pdfPath, buf, {
        upsert: true,
        contentType: "application/pdf",
      });
      if (up.error) {
        console.error("tv-public pdf upload error", up.error);
        return NextResponse.json({ error: "upload-failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("tv-public upload POST", e);
    return NextResponse.json({ error: "upload-failed" }, { status: 500 });
  }
}
