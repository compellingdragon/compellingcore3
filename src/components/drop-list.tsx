"use client";

import { useMemo, useState } from "react";
import type { DropRecord } from "@/lib/drop-types";
import { DropCard } from "@/components/drop-card";
import { DROP_CATEGORIES, type DropCategoryKey } from "@/lib/categories";

export function DropList({ drops, allowDelete = false }: { drops: DropRecord[]; allowDelete?: boolean }) {
  const [filter, setFilter] = useState<"ALL" | DropCategoryKey>("ALL");
  const filtered = useMemo(
    () => (filter === "ALL" ? drops : drops.filter((drop) => drop.category === filter)),
    [drops, filter]
  );

  return (
    <>
      <div className="filter-row" role="group" aria-label="Filter drops">
        <button type="button" className={filter === "ALL" ? "filter-active" : ""} onClick={() => setFilter("ALL")}>All</button>
        {(Object.keys(DROP_CATEGORIES) as DropCategoryKey[]).map((key) => (
          <button type="button" key={key} className={filter === key ? "filter-active" : ""} onClick={() => setFilter(key)}>
            {DROP_CATEGORIES[key].label}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="drop-grid">
          {filtered.map((drop) => <DropCard key={drop.id} drop={drop} allowDelete={allowDelete} />)}
        </div>
      ) : (
        <div className="empty-state">No drops in this category yet.</div>
      )}
    </>
  );
}
