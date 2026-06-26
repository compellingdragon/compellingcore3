import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, Paperclip, Send } from "lucide-react";
import { DROP_CATEGORIES, type DropCategoryKey } from "@/lib/categories";

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <div className="status-pill"><span /> Member access is live</div>
          <h1>Controlled drops.<br /><span>One compelling core.</span></h1>
          <p>
            A sleek, Discord-connected release hub for trusted members. Authenticate, verify your server role,
            publish assets and announce every release through a rich Discord embed.
          </p>
          <div className="hero-actions">
            <Link href="/drops" className="button button-primary">Explore drops <ArrowRight size={17} /></Link>
            <Link href="/panel" className="button button-secondary">Open dropper panel</Link>
          </div>
          <div className="trust-row">
            <span><Check size={15} /> Discord OAuth</span>
            <span><Check size={15} /> Live role verification</span>
            <span><Check size={15} /> Attachment uploads</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orbital-card glass-panel">
            <div className="visual-topline"><span>compellingcore / drops</span><span className="live-dot">live</span></div>
            <Image src="/brand-mark.png" alt="CompellingCore" width={220} height={220} priority />
            <div className="visual-metrics">
              <div><strong>4</strong><span>drop lanes</span></div>
              <div><strong>1</strong><span>trusted role</span></div>
              <div><strong>24/7</strong><span>web access</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <span className="eyebrow">Organized release lanes</span>
          <h2>Everything your members need, without the noise.</h2>
        </div>
        <div className="category-grid">
          {(Object.keys(DROP_CATEGORIES) as DropCategoryKey[]).map((key, index) => {
            const item = DROP_CATEGORIES[key];
            const Icon = item.icon;
            return (
              <Link href={`/drops?category=${key}`} className="category-card" key={key}>
                <span className="category-number">0{index + 1}</span>
                <Icon size={25} />
                <h3>{item.label}</h3>
                <p>{item.description}</p>
                <ArrowRight size={18} className="card-arrow" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section shell workflow-section">
        <div className="section-heading compact">
          <span className="eyebrow">The release flow</span>
          <h2>Three steps from idea to Discord.</h2>
        </div>
        <div className="workflow-grid">
          <div className="workflow-card"><LockKeyhole /><span>01</span><h3>Authenticate</h3><p>Members sign in through Discord. No local passwords to manage.</p></div>
          <div className="workflow-card"><Paperclip /><span>02</span><h3>Build the drop</h3><p>Add details, choose a category and securely upload an attachment.</p></div>
          <div className="workflow-card"><Send /><span>03</span><h3>Publish everywhere</h3><p>The drop lands on the site and a polished embed appears in Discord.</p></div>
        </div>
      </section>

      <section className="cta-section shell">
        <div>
          <span className="eyebrow">Ready when your role is</span>
          <h2>Enter the CompellingCore dropper panel.</h2>
        </div>
        <Link href="/panel" className="button button-primary">Verify and continue <ArrowRight size={17} /></Link>
      </section>
    </>
  );
}
