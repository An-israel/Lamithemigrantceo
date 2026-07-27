"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Application, ApplicationStatus } from "@/lib/types";

const STATUSES: ApplicationStatus[] = ["new", "reviewing", "accepted", "declined"];

export function ApplicationsInbox({ initial }: { initial: Application[] }) {
  const [rows, setRows] = useState<Application[]>(initial);
  const [selected, setSelected] = useState<Application | null>(null);

  async function setStatus(a: Application, status: ApplicationStatus) {
    setRows((r) => r.map((x) => (x.id === a.id ? { ...x, status } : x)));
    setSelected((s) => (s && s.id === a.id ? { ...s, status } : s));
    const supabase = createClient();
    await supabase.from("applications").update({ status }).eq("id", a.id);
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-card border border-line bg-peach p-6 text-sm text-muted">
        No applications yet. They arrive here from the “Apply” option on program
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
              <tr key={a.id} onClick={() => setSelected(a)} className="cursor-pointer hover:bg-peach/40">
                <td className="px-4 py-3 font-bold">{a.name}</td>
                <td className="px-4 py-3 text-muted">{a.program_name || "—"}</td>
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
              <div><dt className="label">Programme</dt><dd>{selected.program_name || "—"}</dd></div>
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
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={`mailto:${selected.email}`} className="btn btn-primary text-sm">Reply by email</a>
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
