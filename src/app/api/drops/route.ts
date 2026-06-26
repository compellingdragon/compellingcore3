import { NextResponse } from "next/server";
import { z } from "zod";
import { createDrop } from "@/lib/db";
import { getApiAuthorization } from "@/lib/auth";
import { sendDropWebhook } from "@/lib/discord-webhook";
import {
  deleteR2Object,
  inspectR2Object,
  isAllowedR2ContentType,
  R2_MAX_FILE_SIZE,
  userOwnsR2Key
} from "@/lib/r2";

export const runtime = "nodejs";

const dropSchema = z.object({
  title: z.string().trim().min(3).max(80),
  summary: z.string().trim().min(10).max(220),
  content: z.string().trim().min(10).max(8000),
  category: z.enum(["ACCOUNTS", "METHODS", "TOOLS", "OTHER"]),
  // This keeps the existing database/API shape, but now stores a private R2 object key.
  attachmentUrl: z.string().trim().max(420).optional().or(z.literal("")),
  attachmentName: z.string().trim().max(180).optional().or(z.literal("")),
  attachmentType: z.string().trim().max(120).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  const auth = await getApiAuthorization();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let uploadedObjectKey: string | null = null;

  try {
    const input = dropSchema.parse(await request.json());
    let attachmentName: string | null = null;
    let attachmentType: string | null = null;

    if (input.attachmentUrl) {
      uploadedObjectKey = input.attachmentUrl;

      if (!userOwnsR2Key(uploadedObjectKey, auth.session.user.id)) {
        return NextResponse.json({ error: "Invalid attachment key." }, { status: 403 });
      }

      const object = await inspectR2Object(uploadedObjectKey);
      const storedSize = object.ContentLength ?? 0;
      const storedType = (object.ContentType ?? input.attachmentType ?? "").split(";", 1)[0].toLowerCase();

      if (!storedSize || storedSize > R2_MAX_FILE_SIZE) {
        await deleteR2Object(uploadedObjectKey).catch(() => undefined);
        return NextResponse.json({ error: "The uploaded file is empty or larger than 15 MB." }, { status: 400 });
      }

      if (!isAllowedR2ContentType(storedType)) {
        await deleteR2Object(uploadedObjectKey).catch(() => undefined);
        return NextResponse.json({ error: "The uploaded file type is not allowed." }, { status: 400 });
      }

      attachmentName = input.attachmentName || "attachment";
      attachmentType = storedType;
    }

    const drop = await createDrop({
      title: input.title,
      summary: input.summary,
      content: input.content,
      category: input.category,
      attachmentUrl: uploadedObjectKey,
      attachmentName,
      attachmentType,
      creatorDiscordId: auth.session.user.id,
      creatorName: auth.session.user.name ?? "Discord member",
      creatorAvatar: auth.session.user.image ?? null
    });

    try {
      await sendDropWebhook(drop);
    } catch (error) {
      console.error("Drop created but Discord webhook failed", error);
    }

    return NextResponse.json({ drop }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid drop." }, { status: 400 });
    }

    if (uploadedObjectKey) {
      await deleteR2Object(uploadedObjectKey).catch((cleanupError) => {
        console.error("Could not clean up attachment after failed drop creation", cleanupError);
      });
    }

    console.error(error);
    return NextResponse.json({ error: "Could not create the drop." }, { status: 500 });
  }
}
