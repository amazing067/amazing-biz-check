import { NextResponse } from "next/server";
import {
  getTvPublicStoragePdfPath,
  getTvPublicStorageProposalPath,
  TV_PUBLIC_STORAGE_BUCKET,
} from "@/lib/tv-public-assets";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        {
          rev: 0,
          proposal: false,
          pdf: false,
          proposalUrl: "",
          pdfUrl: "",
          error: "supabase-not-configured",
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    const proposalPath = getTvPublicStorageProposalPath();
    const pdfPath = getTvPublicStoragePdfPath();

    const [proposalRes, pdfRes] = await Promise.all([
      supabase.storage.from(TV_PUBLIC_STORAGE_BUCKET).list("assets", {
        search: proposalPath.split("/").pop(),
        limit: 1,
      }),
      supabase.storage.from(TV_PUBLIC_STORAGE_BUCKET).list("assets", {
        search: pdfPath.split("/").pop(),
        limit: 1,
      }),
    ]);

    const proposalFile = (proposalRes.data ?? []).find((x) => x.name === "tv-public-proposal.png");
    const pdfFile = (pdfRes.data ?? []).find((x) => x.name === "tv-public-monthly.pdf");

    const proposal = Boolean(proposalFile);
    const pdf = Boolean(pdfFile);

    const rev = Math.max(
      proposalFile?.updated_at ? Date.parse(proposalFile.updated_at) || 0 : 0,
      pdfFile?.updated_at ? Date.parse(pdfFile.updated_at) || 0 : 0,
    );

    const proposalUrl = proposal ? `/api/tv-public/file/proposal?v=${rev || Date.now()}` : "";
    const pdfUrl = pdf ? `/api/tv-public/file/pdf?v=${rev || Date.now()}` : "";

    return NextResponse.json({ rev, proposal, pdf, proposalUrl, pdfUrl }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (e) {
    console.error("tv-public meta GET", e);
    return NextResponse.json(
      { rev: 0, proposal: false, pdf: false, proposalUrl: "", pdfUrl: "" },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
