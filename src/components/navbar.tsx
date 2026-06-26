import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SignInButton, SignOutButton } from "@/components/auth-button";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="Primary navigation">
        <Link href="/" className="brand" aria-label="CompellingCore home">
          <Image src="/brand-mark.png" alt="" width={38} height={38} priority />
          <span>compelling<span>core</span></span>
        </Link>

        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/drops">Drops</Link>
          <Link href="/panel">Panel</Link>
        </div>

        <div className="nav-actions">
          {session?.user ? (
            <>
              <div className="user-chip">
                {session.user.image ? <Image src={session.user.image} alt="" width={28} height={28} /> : null}
                <span>{session.user.name ?? "Member"}</span>
              </div>
              <SignOutButton />
            </>
          ) : (
            <SignInButton label="Login" />
          )}
        </div>
      </nav>
    </header>
  );
}
