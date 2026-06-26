import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { SignInButton } from "@/components/auth-button";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <section className="auth-page shell">
      <div className="auth-card glass-panel">
        <Image src="/brand-mark.png" alt="CompellingCore" width={92} height={92} priority />
        <span className="eyebrow">Secure member gateway</span>
        <h1>Continue with Discord</h1>
        <p>Your Discord ID is checked against the configured CompellingCore server role before panel access is granted.</p>
        <SignInButton />
        <div className="security-note"><ShieldCheck size={17} /><span>We request only your basic Discord identity. Role checks happen server-side through the CompellingCore bot.</span></div>
      </div>
    </section>
  );
}
