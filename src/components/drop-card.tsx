import type { DropRecord } from "@/lib/drop-types";
import { Download, ExternalLink } from "lucide-react";
import { DROP_CATEGORIES } from "@/lib/categories";

export function DropCard({ drop, allowDelete = false }: { drop: DropRecord; allowDelete?: boolean }) {
  const meta = DROP_CATEGORIES[drop.category];
  const Icon = meta.icon;

  return (
    <article className="drop-card" id={drop.id}>
      <div className="drop-card-topline">
        <span className={`category-pill category-${drop.category.toLowerCase()}`}>
          <Icon size={14} /> {meta.label}
        </span>
        <time dateTime={drop.createdAt.toISOString()}>
          {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(drop.createdAt)}
        </time>
      </div>

      <div>
        <h3>{drop.title}</h3>
        <p className="drop-summary">{drop.summary}</p>
      </div>

      <div className="drop-content">{drop.content}</div>

      <div className="drop-footer">
        <span>by {drop.creatorName}</span>
        <div className="drop-actions">
          {drop.attachmentUrl ? (
            <a className="button button-ghost button-small" href={`/api/files?id=${encodeURIComponent(drop.id)}`} target="_blank" rel="noreferrer">
              {drop.attachmentType?.startsWith("image/") ? <ExternalLink size={15} /> : <Download size={15} />}
              {drop.attachmentName ?? "Attachment"}
            </a>
          ) : null}
          {allowDelete ? (
            <button type="button" className="button button-danger button-small" data-delete-button={drop.id}>Delete</button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
