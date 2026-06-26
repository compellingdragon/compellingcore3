import type { DropRecord } from "@/lib/drop-types";
import { DROP_CATEGORIES } from "@/lib/categories";

export async function sendDropWebhook(drop: DropRecord) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  const dropUrl = siteUrl ? `${siteUrl}/drops#${drop.id}` : undefined;
  const category = DROP_CATEGORIES[drop.category];

  const payload = {
    username: "CompellingCore Drops",
    avatar_url: siteUrl ? `${siteUrl}/brand-mark.png` : undefined,
    embeds: [
      {
        title: `New ${category.label} drop — ${drop.title}`,
        url: dropUrl,
        description: drop.summary,
        color: 0x8b5cf6,
        author: {
          name: drop.creatorName,
          icon_url: drop.creatorAvatar ?? undefined
        },
        fields: [
          { name: "Category", value: category.label, inline: true },
          { name: "Released", value: `<t:${Math.floor(drop.createdAt.getTime() / 1000)}:R>`, inline: true },
          ...(drop.attachmentUrl && dropUrl
            ? [{ name: "Attachment", value: `[Open the role-gated drop](${dropUrl})`, inline: false }]
            : [])
        ],
        footer: { text: "compellingcore • controlled community drops" },
        timestamp: drop.createdAt.toISOString()
      }
    ],
    allowed_mentions: { parse: [] }
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.error("Discord webhook failed", response.status, await response.text());
  }
}
