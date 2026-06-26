import { NextResponse } from "next/server";
import { getDrop, deleteDrop } from "@/lib/db";
import { getApiAuthorization } from "@/lib/auth";
import { deleteR2Object } from "@/lib/r2";

export const runtime = "nodejs";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getApiAuthorization();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const drop = await getDrop(id);
  if (!drop) return NextResponse.json({ error: "Drop not found." }, { status: 404 });

  await deleteDrop(id);

  if (drop.attachmentUrl) {
    try {
      await deleteR2Object(drop.attachmentUrl);
    } catch (error) {
      console.error("Drop deleted but R2 attachment cleanup failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}
