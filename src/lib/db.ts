import postgres from "postgres";
import type { CreateDropInput, DropRecord } from "@/lib/drop-types";

let client: ReturnType<typeof postgres> | undefined;

function sqlClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  client ??= postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });

  return client;
}

type RawDrop = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: DropRecord["category"];
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  creator_discord_id: string;
  creator_name: string;
  creator_avatar: string | null;
  created_at: Date;
  updated_at: Date;
};

function mapDrop(row: RawDrop): DropRecord {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    attachmentUrl: row.attachment_url,
    attachmentName: row.attachment_name,
    attachmentType: row.attachment_type,
    creatorDiscordId: row.creator_discord_id,
    creatorName: row.creator_name,
    creatorAvatar: row.creator_avatar,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

export async function listDrops(limit?: number): Promise<DropRecord[]> {
  const sql = sqlClient();
  const rows = limit
    ? await sql<RawDrop[]>`SELECT * FROM drops ORDER BY created_at DESC LIMIT ${limit}`
    : await sql<RawDrop[]>`SELECT * FROM drops ORDER BY created_at DESC`;
  return rows.map(mapDrop);
}

export async function getDrop(id: string): Promise<DropRecord | null> {
  const sql = sqlClient();
  const rows = await sql<RawDrop[]>`SELECT * FROM drops WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapDrop(rows[0]) : null;
}

export async function createDrop(input: CreateDropInput): Promise<DropRecord> {
  const sql = sqlClient();
  const id = crypto.randomUUID();
  const rows = await sql<RawDrop[]>`
    INSERT INTO drops (
      id, title, summary, content, category,
      attachment_url, attachment_name, attachment_type,
      creator_discord_id, creator_name, creator_avatar
    ) VALUES (
      ${id}, ${input.title}, ${input.summary}, ${input.content}, ${input.category},
      ${input.attachmentUrl}, ${input.attachmentName}, ${input.attachmentType},
      ${input.creatorDiscordId}, ${input.creatorName}, ${input.creatorAvatar}
    )
    RETURNING *
  `;
  return mapDrop(rows[0]);
}

export async function deleteDrop(id: string): Promise<void> {
  const sql = sqlClient();
  await sql`DELETE FROM drops WHERE id = ${id}`;
}
