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

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "supabase-not-configured" }, { status: 503 });
    }

    let body: { password?: string; kind?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }

    const password = String(body?.password ?? "").trim();
    if (password !== getTvPublicUploadPassword()) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const kind = String(body?.kind ?? "").trim();
    const path =
      kind === "proposal"
        ? getTvPublicStorageProposalPath()
        : kind === "pdf"
          ? getTvPublicStoragePdfPath()
          : null;

    if (!path) {
      return NextResponse.json({ error: "invalid-kind" }, { status: 400 });
    }

    await supabase.storage.createBucket(TV_PUBLIC_STORAGE_BUCKET, { public: false }).catch(() => {});

    const signed = await supabase.storage
      .from(TV_PUBLIC_STORAGE_BUCKET)
      .createSignedUploadUrl(path, { upsert: true });

    if (signed.error || !signed.data) {
      console.error("tv-public createSignedUploadUrl", signed.error);
      return NextResponse.json({ error: "sign-failed" }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: signed.data.signedUrl,
      token: signed.data.token,
      path: signed.data.path,
    });
  } catch (e) {
    console.error("tv-public sign-upload POST", e);
    return NextResponse.json({ error: "sign-failed" }, { status: 500 });
  }
}
