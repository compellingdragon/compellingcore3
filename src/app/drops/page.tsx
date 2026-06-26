import { listDrops } from "@/lib/db";
import { requireAuthorizedSession } from "@/lib/auth";
import { DropList } from "@/components/drop-list";

export const metadata = { title: "Drops" };
export const dynamic = "force-dynamic";

export default async function DropsPage() {
  await requireAuthorizedSession();
  const drops = await listDrops();

  return (
    <section className="page-section shell">
      <div className="page-heading">
        <div><span className="eyebrow">Member vault</span><h1>Latest drops</h1></div>
        <p>Every release is visible only after a live Discord role check.</p>
      </div>
      <DropList drops={drops} />
    </section>
  );
}
