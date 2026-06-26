"use client";

import { useEffect } from "react";

export function DeleteController() {
  useEffect(() => {
    async function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>("[data-delete-button]");
      if (!button) return;
      const id = button.dataset.deleteButton;
      if (!id || !window.confirm("Delete this drop and its attachment?")) return;

      button.disabled = true;
      button.textContent = "Deleting…";
      const response = await fetch(`/api/drops/${id}`, { method: "DELETE" });
      if (response.ok) window.location.reload();
      else {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Could not delete the drop.");
        button.disabled = false;
        button.textContent = "Delete";
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
