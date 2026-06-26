import { NextResponse } from "next/server";
import { getApiAuthorization } from "@/lib/auth";
import { getDrop } from "@/lib/db";
import { createR2DownloadUrl } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await getApiAuthorization();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing drop ID." }, { status: 400 });

  const drop = await getDrop(id);
  if (!drop?.attachmentUrl) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  try {
    const downloadUrl = await createR2DownloadUrl(drop.attachmentUrl);
    const response = NextResponse.redirect(downloadUrl, 302);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    console.error("Could not create R2 download URL", error);
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }
}
