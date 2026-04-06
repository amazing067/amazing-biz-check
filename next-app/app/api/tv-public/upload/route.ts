import { NextRequest, NextResponse } from "next/server";
import {
  getTvPublicStoragePdfPath,
  getTvPublicStorageProposalPath,
  getTvPublicUploadPassword,
  TV_PUBLIC_STORAGE_BUCKET,
} from "@/lib/tv-public-assets";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PNG/PDF 본문 업로드는 `/api/tv-public/sign-upload` + 브라우저→Storage 직접 PUT (플랫폼 본문 한도 회피). 여기서는 초기화(삭제)만 처리. */

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

    await supabase.storage.createBucket(TV_PUBLIC_STORAGE_BUCKET, { public: false }).catch(() => {});

    const resetProposal = String(form.get("resetProposal") ?? "") === "1";
    const resetPdf = String(form.get("resetPdf") ?? "") === "1";

    if (resetProposal) {
      await supabase.storage.from(TV_PUBLIC_STORAGE_BUCKET).remove([proposalPath]);
    }

    if (resetPdf) {
      await supabase.storage.from(TV_PUBLIC_STORAGE_BUCKET).remove([pdfPath]);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("tv-public upload POST", e);
    return NextResponse.json({ error: "upload-failed" }, { status: 500 });
  }
}
