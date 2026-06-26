export type DiscordAccessResult = {
  allowed: boolean;
  roleIds: string[];
  reason?: "missing-config" | "not-in-guild" | "missing-role" | "discord-error";
};

const DISCORD_API = "https://discord.com/api/v10";

export async function checkDiscordAccess(userId: string): Promise<DiscordAccessResult> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const allowedRoleIds = (process.env.DISCORD_ALLOWED_ROLE_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!guildId || !botToken || allowedRoleIds.length === 0) {
    return { allowed: false, roleIds: [], reason: "missing-config" };
  }

  try {
    const response = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store"
    });

    if (response.status === 404) {
      return { allowed: false, roleIds: [], reason: "not-in-guild" };
    }

    if (!response.ok) {
      console.error("Discord member lookup failed", response.status, await response.text());
      return { allowed: false, roleIds: [], reason: "discord-error" };
    }

    const member = (await response.json()) as { roles?: string[] };
    const roleIds = member.roles ?? [];
    const allowed = allowedRoleIds.some((roleId) => roleIds.includes(roleId));

    return {
      allowed,
      roleIds,
      reason: allowed ? undefined : "missing-role"
    };
  } catch (error) {
    console.error("Discord access check failed", error);
    return { allowed: false, roleIds: [], reason: "discord-error" };
  }
}
