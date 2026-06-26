"use client";

import { signIn, signOut } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

export function SignInButton({ label = "Continue with Discord" }: { label?: string }) {
  return (
    <button className="button button-primary" onClick={() => signIn("discord", { callbackUrl: "/panel" })}>
      <LogIn size={17} />
      {label}
    </button>
  );
}

export function SignOutButton() {
  return (
    <button className="button button-ghost button-small" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut size={15} />
      Sign out
    </button>
  );
}
