import { listDrops } from "@/lib/db";
import { requireAuthorizedSession } from "@/lib/auth";
import { DropForm } from "@/components/drop-form";
import { DropList } from "@/components/drop-list";
import { DeleteController } from "@/components/delete-controller";

export const metadata = { title: "Dropper panel" };
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const session = await requireAuthorizedSession();
  const drops = await listDrops(12);

  return (
    <section className="page-section shell">
      <div className="page-heading">
        <div><span className="eyebrow">Verified as {session.user.name ?? "member"}</span><h1>Dropper panel</h1></div>
        <p>Publish a release, attach a file and send the matching Discord embed in one action.</p>
      </div>
      <DropForm />
      <div className="panel-history">
        <div className="section-heading compact"><span className="eyebrow">Moderation</span><h2>Recent releases</h2></div>
        <DropList drops={drops} allowDelete />
      </div>
      <DeleteController />
    </section>
  );
}
