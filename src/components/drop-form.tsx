"use client";

import { useRef, useState } from "react";
import { FileUp, LoaderCircle, Rocket, X } from "lucide-react";
import { DROP_CATEGORIES, type DropCategoryKey } from "@/lib/categories";

type PreparedUpload = {
  uploadUrl: string;
  objectKey: string;
  contentType: string;
  headers: Record<string, string>;
  error?: string;
};

export function DropForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function cleanupUpload(objectKey: string) {
    await fetch("/api/uploads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectKey })
    }).catch(() => undefined);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    let attachmentUrl = "";

    try {
      const form = new FormData(event.currentTarget);
      let attachmentType = file?.type ?? "";

      if (file) {
        const prepareResponse = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size
          })
        });

        const prepared = (await prepareResponse.json()) as PreparedUpload;
        if (!prepareResponse.ok) throw new Error(prepared.error ?? "Could not prepare the upload.");

        const uploadResponse = await fetch(prepared.uploadUrl, {
          method: "PUT",
          headers: prepared.headers,
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error(`Cloudflare R2 upload failed (${uploadResponse.status}).`);
        }

        attachmentUrl = prepared.objectKey;
        attachmentType = prepared.contentType;
      }

      const response = await fetch("/api/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          summary: form.get("summary"),
          content: form.get("content"),
          category: form.get("category"),
          attachmentUrl,
          attachmentName: file?.name ?? "",
          attachmentType
        })
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not publish drop.");

      formRef.current?.reset();
      setFile(null);
      setMessage({ type: "success", text: "Drop published and Discord embed sent." });
      window.setTimeout(() => window.location.assign("/drops"), 900);
    } catch (error) {
      if (attachmentUrl) await cleanupUpload(attachmentUrl);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} className="drop-form glass-panel" onSubmit={submit}>
      <div className="form-heading">
        <div>
          <span className="eyebrow">Role-gated publisher</span>
          <h2>Create a new drop</h2>
        </div>
        <Rocket size={24} />
      </div>

      <div className="form-grid form-grid-two">
        <label>
          <span>Title</span>
          <input name="title" minLength={3} maxLength={80} placeholder="What are you releasing?" required />
        </label>
        <label>
          <span>Category</span>
          <select name="category" defaultValue="TOOLS">
            {(Object.keys(DROP_CATEGORIES) as DropCategoryKey[]).map((key) => (
              <option key={key} value={key}>{DROP_CATEGORIES[key].label}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span>Short summary</span>
        <input name="summary" minLength={10} maxLength={220} placeholder="A concise description used in cards and the Discord embed." required />
      </label>

      <label>
        <span>Drop content</span>
        <textarea name="content" minLength={10} maxLength={8000} rows={9} placeholder="Write the instructions, details or release notes. Plain text is rendered safely." required />
      </label>

      <label className="upload-zone">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,application/zip,.zip"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <FileUp size={24} />
        <span>{file ? file.name : "Add an optional attachment"}</span>
        <small>Images, PDF, TXT or ZIP • maximum 15 MB • private Cloudflare R2 storage</small>
        {file ? (
          <button type="button" aria-label="Remove attachment" onClick={(event) => { event.preventDefault(); setFile(null); }}>
            <X size={16} />
          </button>
        ) : null}
      </label>

      {message ? <div className={`form-message ${message.type}`}>{message.text}</div> : null}

      <button className="button button-primary button-wide" disabled={busy}>
        {busy ? <LoaderCircle size={18} className="spin" /> : <Rocket size={18} />}
        {busy ? "Publishing…" : "Publish drop"}
      </button>
    </form>
  );
}
