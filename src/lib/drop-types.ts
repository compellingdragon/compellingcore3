import type { DropCategoryKey } from "@/lib/categories";

export type DropRecord = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: DropCategoryKey;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  creatorDiscordId: string;
  creatorName: string;
  creatorAvatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDropInput = Omit<DropRecord, "id" | "createdAt" | "updatedAt">;
