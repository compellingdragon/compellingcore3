import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAuthorization } from "@/lib/auth";
import {
  createR2Upload,
  deleteR2Object,
  isAllowedR2ContentType,
  normalizeR2ContentType,
  R2_MAX_FILE_SIZE,
  userOwnsR2Key
} from "@/lib/r2";

export const runtime = "nodejs";

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.string().trim().max(120),
  size: z.number().int().positive().max(R2_MAX_FILE_SIZE)
});

const deleteSchema = z.object({
  objectKey: z.string().trim().min(1).max(420)
});

export async function POST(request: Request) {
  const auth = await getApiAuthorization();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const input = uploadSchema.parse(await request.json());
    const contentType = normalizeR2ContentType(input.fileName, input.contentType);

    if (!isAllowedR2ContentType(contentType)) {
      return NextResponse.json({ error: "This file type is not allowed." }, { status: 400 });
    }

    const upload = await createR2Upload({
      userId: auth.session.user.id,
      fileName: input.fileName,
      contentType
    });

    return NextResponse.json({ ...upload, contentType });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid upload." }, { status: 400 });
    }
    console.error("Could not create R2 upload URL", error);
    return NextResponse.json({ error: "Could not prepare the upload." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await getApiAuthorization();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { objectKey } = deleteSchema.parse(await request.json());
    if (!userOwnsR2Key(objectKey, auth.session.user.id)) {
      return NextResponse.json({ error: "Invalid attachment key." }, { status: 403 });
    }

    await deleteR2Object(objectKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    }
    console.error("Could not clean up R2 upload", error);
    return NextResponse.json({ error: "Could not remove the attachment." }, { status: 500 });
  }
}
