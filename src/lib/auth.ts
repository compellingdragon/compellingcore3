import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { checkDiscordAccess } from "@/lib/discord";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "identify" } }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile && "id" in profile && typeof profile.id === "string") {
        token.discordId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.discordId) {
        session.user.id = token.discordId;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuthorizedSession() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const access = await checkDiscordAccess(session.user.id);
  if (!access.allowed) redirect(`/unauthorized?reason=${access.reason ?? "missing-role"}`);

  return session;
}

export async function getApiAuthorization() {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false as const, status: 401, error: "Sign in with Discord first." };
  }

  const access = await checkDiscordAccess(session.user.id);
  if (!access.allowed) {
    return { ok: false as const, status: 403, error: "Your Discord account does not have an allowed role." };
  }

  return { ok: true as const, session };
}
