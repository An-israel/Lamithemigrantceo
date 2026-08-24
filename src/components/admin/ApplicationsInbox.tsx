"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Application, ApplicationStatus } from "@/lib/types";

const STATUSES: ApplicationStatus[] = ["new", "reviewing", "accepted", "declined"];

export function ApplicationsInbox({ initial }: { initial: Application[] }) {
  const [rows, setRows] = useState<Application[]>(initial);
  const [selected, setSelected] = useState<Application | null>(null);
  const [reply, setReply] = useState("");
  const [replyState, setReplyState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function setStatus(a: Application, status: ApplicationStatus) {
    setRows((r) => r.map((x) => (x.id === a.id ? { ...x, status } : x)));
    setSelected((s) => (s && s.id === a.id ? { ...s, status } : s));
    const supabase = createClient();
    await supabase.from("applications").update({ status }).eq("id", a.id);
  }

  function open(a: Application) {
    setSelected(a);
    setReply("");
    setReplyState("idle");
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setReplyState("sending");
    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selected.email,
          name: selected.name,
          message: reply,
          subject: `Re: your application${selected.product_name ? ` for ${selected.product_name}` : ""}`,
        }),
      });
      if (!res.ok) throw new Error();
      setReplyState("sent");
      setReply("");
    } catch {
      setReplyState("error");
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-card border border-line bg-peach p-6 text-sm text-muted">
        No applications yet. They arrive here from the “Apply” option on product
        pages.
      </p>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-card border border-line">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-line">
            {rows.map((a) => (
              <tr key={a.id} onClick={() => open(a)} className="cursor-pointer hover:bg-peach/40">
                <td className="px-4 py-3 font-bold">{a.name}</td>
                <td className="px-4 py-3 text-muted">{a.product_name || "None"}</td>
                <td className="px-4 py-3 capitalize">{a.status}</td>
                <td className="px-4 py-3 text-right text-muted">
                  {new Date(a.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSelected(null)} />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-shell p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3>{selected.name}</h3>
                <p className="text-sm text-muted">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-2xl leading-none text-muted" aria-label="Close">×</button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="label">Product</dt><dd>{selected.product_name || "None"}</dd></div>
              {selected.whatsapp && <div><dt className="label">WhatsApp</dt><dd>{selected.whatsapp}</dd></div>}
              {selected.answers && (
                <div>
                  <dt className="label">Answers</dt>
                  <dd className="whitespace-pre-wrap">
                    {Object.entries(selected.answers).map(([k, v]) => `${k}: ${v}`).join("\n")}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6">
              <label className="label mb-2 block">Reply by email</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                placeholder={`Write your reply to ${selected.name.split(" ")[0]}…`}
                className="field resize-y"
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={sendReply}
                  disabled={replyState === "sending" || !reply.trim()}
                  className="btn btn-primary text-sm"
                >
                  {replyState === "sending" ? "Sending…" : "Send reply"}
                </button>
                {replyState === "sent" && <span className="text-sm text-jade">Sent.</span>}
                {replyState === "error" && (
                  <span className="text-sm text-clay">Could not send. Try again.</span>
                )}
                <a
                  href={`mailto:${selected.email}`}
                  className="text-sm text-clay underline"
                >
                  Open in email app instead
                </a>
              </div>
            </div>

            <div className="mt-6">
              <label className="label mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(selected, s)}
                    className={`pill border capitalize ${selected.status === s ? "bg-clay text-shell border-clay" : "border-line text-ink hover:border-clay"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
