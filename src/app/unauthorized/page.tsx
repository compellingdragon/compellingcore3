import Link from "next/link";
import { CircleAlert, ExternalLink } from "lucide-react";

export const metadata = { title: "Access denied" };

export default async function UnauthorizedPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const message = reason === "not-in-guild"
    ? "Your Discord account is not currently in the configured server."
    : reason === "missing-config"
      ? "The owner has not finished configuring the Discord role gate."
      : reason === "discord-error"
        ? "Discord could not be reached for a live role check. Please try again shortly."
        : "Your account is in the server, but it does not have an allowed role.";

  return (
    <section className="auth-page shell">
      <div className="auth-card glass-panel">
        <CircleAlert size={58} className="warning-icon" />
        <span className="eyebrow">Role verification failed</span>
        <h1>Access not granted</h1>
        <p>{message}</p>
        <div className="hero-actions centered">
          <Link href="/" className="button button-secondary">Return home</Link>
          {process.env.NEXT_PUBLIC_DISCORD_INVITE ? (
            <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer" className="button button-primary">
              Open Discord <ExternalLink size={16} />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
