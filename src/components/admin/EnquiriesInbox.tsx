"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clsx } from "@/lib/clsx";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

const FILTERS: { key: "all" | EnquiryStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
];

function StatusDot({ status }: { status: EnquiryStatus }) {
  const cls =
    status === "new"
      ? "bg-clay"
      : status === "replied"
        ? "bg-jade"
        : "border border-line";
  return <span className={clsx("inline-block h-2.5 w-2.5 rounded-full", cls)} />;
}

export function EnquiriesInbox({ initial }: { initial: Enquiry[] }) {
  const [rows, setRows] = useState<Enquiry[]>(initial);
  const [filter, setFilter] = useState<"all" | EnquiryStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  async function updateStatus(enquiry: Enquiry, status: EnquiryStatus) {
    setRows((prev) =>
      prev.map((r) => (r.id === enquiry.id ? { ...r, status } : r))
    );
    setSelected((s) => (s && s.id === enquiry.id ? { ...s, status } : s));
    const supabase = createClient();
    await supabase.from("enquiries").update({ status }).eq("id", enquiry.id);
  }

  async function saveNotes(enquiry: Enquiry) {
    const supabase = createClient();
    await supabase
      .from("enquiries")
      .update({ admin_notes: notes })
      .eq("id", enquiry.id);
  }

  function open(enquiry: Enquiry) {
    setSelected(enquiry);
    setNotes(enquiry.admin_notes || "");
    if (enquiry.status === "new") updateStatus(enquiry, "read");
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                "pill border text-sm",
                filter === f.key
                  ? "bg-clay text-shell border-clay"
                  : "border-line text-ink hover:border-clay"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, message"
          className="field max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-card border border-line">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            No enquiries yet. When someone uses the contact form it lands here.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-line">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => open(r)}
                  className="cursor-pointer hover:bg-peach/40"
                >
                  <td className="px-4 py-3">
                    <StatusDot status={r.status} />
                  </td>
                  <td className="px-4 py-3 font-bold">{r.name}</td>
                  <td className="px-4 py-3 text-muted">{r.topic}</td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {r.message.slice(0, 40)}
                    {r.message.length > 40 ? "…" : ""}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {new Date(r.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-clay">›</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-shell p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3>{selected.name}</h3>
                <p className="text-sm text-muted">{selected.email}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-muted"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="label">Topic</dt>
                <dd>{selected.topic}</dd>
              </div>
              {selected.whatsapp && (
                <div>
                  <dt className="label">WhatsApp</dt>
                  <dd>{selected.whatsapp}</dd>
                </div>
              )}
              <div>
                <dt className="label">Message</dt>
                <dd className="whitespace-pre-wrap">{selected.message}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`mailto:${selected.email}?subject=Re: your message to Lami`}
                className="btn btn-primary text-sm"
              >
                Reply by email
              </a>
              {selected.whatsapp && (
                <a
                  href={`https://wa.me/${selected.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm"
                >
                  Message on WhatsApp
                </a>
              )}
            </div>

            <div className="mt-6">
              <label className="label mb-2 block">Status</label>
              <select
                value={selected.status}
                onChange={(e) =>
                  updateStatus(selected, e.target.value as EnquiryStatus)
                }
                className="field"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </div>

            <div className="mt-6">
              <label className="label mb-2 block">
                Private notes (only you see these)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => saveNotes(selected)}
                rows={4}
                className="field resize-y"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
