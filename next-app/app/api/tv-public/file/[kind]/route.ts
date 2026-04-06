import { NextRequest, NextResponse } from "next/server";
import {
  getTvPublicStoragePdfPath,
  getTvPublicStorageProposalPath,
  TV_PUBLIC_STORAGE_BUCKET,
} from "@/lib/tv-public-assets";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveAsset(kind: string): { path: string; type: string } | null {
  if (kind === "proposal") {
    return { path: getTvPublicStorageProposalPath(), type: "image/png" };
  }
  if (kind === "pdf") {
    return { path: getTvPublicStoragePdfPath(), type: "application/pdf" };
  }
  return null;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ kind: string }> },
) {
  try {
    const params = await ctx.params;
    const asset = resolveAsset(String(params?.kind ?? ""));
    if (!asset) {
      return new NextResponse("not-found", { status: 404 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return new NextResponse("supabase-not-configured", { status: 503 });
    }

    const downloaded = await supabase.storage
      .from(TV_PUBLIC_STORAGE_BUCKET)
      .download(asset.path);

    if (downloaded.error || !downloaded.data) {
      return new NextResponse("not-found", { status: 404 });
    }

    const ab = await downloaded.data.arrayBuffer();
    return new NextResponse(ab, {
      headers: {
        "Content-Type": asset.type,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    console.error("tv-public file GET", e);
    return new NextResponse("internal-error", { status: 500 });
  }
}
