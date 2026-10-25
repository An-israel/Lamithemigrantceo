"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clsx } from "@/lib/clsx";
import type { Subscriber } from "@/lib/types";

const PAGE = 50;

/** Minimal CSV parser: quoted fields, commas/semicolons/tabs, CRLF. */
function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delim = firstLine.includes("\t") ? "\t" : firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

/** Finds the email and name columns, with or without a header row. */
function rowsFromCsv(text: string): { email: string; name: string }[] {
  const rows = parseCsv(text.replace(/^﻿/, ""));
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  let emailCol = header.findIndex((h) => /e-?mail/.test(h));
  const first = header.findIndex((h) => /^first.?name$|^first$/.test(h));
  const last = header.findIndex((h) => /^last.?name$|^surname$|^last$/.test(h));
  const full = header.findIndex((h) => /^(full.?)?name$/.test(h));
  const hasHeader = emailCol >= 0;
  if (!hasHeader) emailCol = rows[0].findIndex((c) => c.includes("@"));
  if (emailCol < 0) emailCol = 0;
  return rows.slice(hasHeader ? 1 : 0).map((r) => ({
    email: (r[emailCol] || "").trim(),
    name: (full >= 0 ? r[full] : [first >= 0 ? r[first] : "", last >= 0 ? r[last] : ""].join(" ")).trim(),
  }));
}

function csvCell(v: string | null) {
  const s = v ?? "";
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

function day(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" }) : "";
}

export function SubscribersManager({ initial }: { initial: Subscriber[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Subscriber[]>(initial);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"subscribed" | "unsubscribed" | "all">("subscribed");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addConsent, setAddConsent] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importConsent, setImportConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    const subscribed = rows.filter((r) => r.status === "subscribed").length;
    return { subscribed, unsubscribed: rows.length - subscribed, all: rows.length };
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "all" || r.status === filter) &&
        (!term || r.email.includes(term) || (r.name || "").toLowerCase().includes(term) || r.source.toLowerCase().includes(term))
    );
  }, [rows, q, filter]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE);
  const preview = useMemo(() => (csvText.trim() ? rowsFromCsv(csvText) : []), [csvText]);

  async function submitRows(list: { email: string; name: string }[], source: "admin" | "import") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/subscribers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: list, consent: true, source }),
      });
      const data = (await res.json()) as { error?: string; added?: number; alreadyOnList?: number; invalidCount?: number; invalid?: string[] };
      if (!res.ok) {
        setMessage({ ok: false, text: data.error || "Couldn't save." });
        return false;
      }
      const parts = [`${data.added} added`];
      if (data.alreadyOnList) parts.push(`${data.alreadyOnList} already on the list (left as they were)`);
      if (data.invalidCount) parts.push(`${data.invalidCount} not valid email addresses${data.invalid?.length ? `: ${data.invalid.slice(0, 5).join(", ")}${data.invalidCount > 5 ? "…" : ""}` : ""}`);
      setMessage({ ok: (data.added ?? 0) > 0 || !data.invalidCount, text: parts.join(" · ") + "." });
      router.refresh();
      const supabase = createClient();
      const fresh: Subscriber[] = [];
      for (let from = 0; from < 20000; from += 1000) {
        const { data: page } = await supabase
          .from("subscribers")
          .select("id, created_at, email, name, status, source, consent_at, unsubscribed_at")
          .order("created_at", { ascending: false })
          .range(from, from + 999);
        fresh.push(...((page as Subscriber[]) || []));
        if (!page || page.length < 1000) break;
      }
      setRows(fresh);
      return true;
    } catch {
      setMessage({ ok: false, text: "Couldn't reach the site. Check your connection." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addOne(e: React.FormEvent) {
    e.preventDefault();
    if (await submitRows([{ email: addEmail, name: addName }], "admin")) {
      setAddEmail("");
      setAddName("");
      setAddConsent(false);
    }
  }

  async function importCsv() {
    if (await submitRows(preview, "import")) {
      setCsvText("");
      setImportConsent(false);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setCsvText(await file.text());
  }

  async function setStatus(s: Subscriber, status: Subscriber["status"]) {
    if (status === "subscribed" && !window.confirm(`Only re-subscribe ${s.email} if they asked you to. Continue?`)) return;
    const patch =
      status === "subscribed"
        ? { status, consent_at: new Date().toISOString(), unsubscribed_at: null }
        : { status, unsubscribed_at: new Date().toISOString() };
    const { error } = await createClient().from("subscribers").update(patch).eq("id", s.id);
    if (error) {
      setMessage({ ok: false, text: `Couldn't update ${s.email}.` });
      return;
    }
    setRows((all) => all.map((r) => (r.id === s.id ? { ...r, ...patch } : r)));
  }

  async function remove(s: Subscriber) {
    if (!window.confirm(`Permanently delete ${s.email} and their details? Use this when someone asks you to erase their data. To just stop emailing them, unsubscribe them instead.`)) return;
    const { error } = await createClient().from("subscribers").delete().eq("id", s.id);
    if (error) {
      setMessage({ ok: false, text: `Couldn't delete ${s.email}.` });
      return;
    }
    setRows((all) => all.filter((r) => r.id !== s.id));
  }

  function exportCsv() {
    const header = ["Email", "Name", "Status", "Source", "Joined", "Unsubscribed"];
    const lines = filtered.map((r) => [r.email, r.name, r.status, r.source, day(r.consent_at), day(r.unsubscribed_at)].map(csvCell).join(","));
    const blob = new Blob([[header.map(csvCell).join(","), ...lines].join("\r\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mt-6 space-y-8">
      <div className="grid grid-cols-3 gap-3">
        {([
          ["Subscribed", counts.subscribed],
          ["Unsubscribed", counts.unsubscribed],
          ["Everyone", counts.all],
        ] as const).map(([label, n]) => (
          <div key={label} className="rounded-card border border-line bg-shell p-4">
            <p className="label">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{n}</p>
          </div>
        ))}
      </div>

      {message && (
        <p role="status" className={clsx("rounded-card border p-3 text-sm", message.ok ? "border-jade text-jade" : "border-[#9b2c1f] text-[#9b2c1f]")}>
          {message.text}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={addOne} className="space-y-3 rounded-card border border-line p-4">
          <h3 className="text-lg">Add someone</h3>
          <div>
            <label htmlFor="sub-add-email" className="label mb-1 block">Email</label>
            <input id="sub-add-email" type="email" required value={addEmail} onChange={(e) => setAddEmail(e.target.value)} className="field" />
          </div>
          <div>
            <label htmlFor="sub-add-name" className="label mb-1 block">Name (optional)</label>
            <input id="sub-add-name" value={addName} onChange={(e) => setAddName(e.target.value)} className="field" />
          </div>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" checked={addConsent} onChange={(e) => setAddConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-clay" />
            <span>They asked to receive my emails.</span>
          </label>
          <button type="submit" disabled={busy || !addConsent} className="btn btn-primary text-sm">
            Add to list
          </button>
        </form>

        <div className="space-y-3 rounded-card border border-line p-4">
          <h3 className="text-lg">Import a list</h3>
          <p className="text-sm text-muted">
            Upload a CSV (from Beacons, a spreadsheet, another email tool) or paste it below. It needs an email column; a
            name column is used if there is one. People who unsubscribed stay unsubscribed.
          </p>
          <label htmlFor="sub-import-file" className="label block">CSV file</label>
          <input id="sub-import-file" type="file" accept=".csv,text/csv,text/plain" onChange={(e) => onFile(e.target.files?.[0])} className="block text-sm" />
          <label htmlFor="sub-import-text" className="label block">Or paste</label>
          <textarea
            id="sub-import-text"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={4}
            placeholder={"email,name\namaka@example.com,Amaka Obi"}
            className="field font-mono text-xs"
          />
          {preview.length > 0 && (
            <p className="text-sm">
              Found <strong>{preview.length}</strong> row{preview.length === 1 ? "" : "s"}, e.g.{" "}
              <span className="font-mono text-xs">{preview.slice(0, 3).map((r) => r.email).join(", ")}</span>
            </p>
          )}
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" checked={importConsent} onChange={(e) => setImportConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-clay" />
            <span>Everyone on this list agreed to receive my emails.</span>
          </label>
          <button onClick={importCsv} disabled={busy || !importConsent || preview.length === 0} className="btn btn-primary text-sm">
            {busy ? "Importing…" : `Import ${preview.length || ""}`.trim()}
          </button>
        </div>
      </div>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="sub-search" className="sr-only">Search subscribers</label>
          <input
            id="sub-search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search email, name or source"
            className="field flex-1"
          />
          <label htmlFor="sub-filter" className="sr-only">Show</label>
          <select
            id="sub-filter"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              setPage(1);
            }}
            className="field sm:w-48"
          >
            <option value="subscribed">Subscribed ({counts.subscribed})</option>
            <option value="unsubscribed">Unsubscribed ({counts.unsubscribed})</option>
            <option value="all">Everyone ({counts.all})</option>
          </select>
          <button onClick={exportCsv} disabled={filtered.length === 0} className="btn btn-secondary shrink-0 text-sm">
            Download CSV
          </button>
        </div>

        <div className="relative mt-4 overflow-x-auto rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-peach/60 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Source</th>
                <th className="p-3">Joined</th>
                <th className="p-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-muted">
                    {rows.length === 0 ? "No subscribers yet." : "Nobody matches."}
                  </td>
                </tr>
              )}
              {shown.map((s) => (
                <tr key={s.id} className={clsx(s.status === "unsubscribed" && "text-muted")}>
                  <td className="p-3 font-mono text-xs">
                    {s.email}
                    {s.status === "unsubscribed" && <span className="ml-2 font-sans text-[11px] uppercase">unsubscribed {day(s.unsubscribed_at)}</span>}
                  </td>
                  <td className="p-3">{s.name || "—"}</td>
                  <td className="p-3 text-muted">{s.source}</td>
                  <td className="whitespace-nowrap p-3 text-muted">{day(s.consent_at)}</td>
                  <td className="whitespace-nowrap p-3 text-right">
                    {s.status === "subscribed" ? (
                      <button onClick={() => setStatus(s, "unsubscribed")} className="text-xs underline">
                        Unsubscribe
                      </button>
                    ) : (
                      <button onClick={() => setStatus(s, "subscribed")} className="text-xs underline">
                        Re-subscribe
                      </button>
                    )}
                    <button onClick={() => remove(s)} className="ml-3 text-xs text-[#9b2c1f] underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="underline disabled:no-underline disabled:opacity-40">
              ← Previous
            </button>
            <span className="text-muted">
              Page {page} of {pages}
            </span>
            <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="underline disabled:no-underline disabled:opacity-40">
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
