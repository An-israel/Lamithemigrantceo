"use client";

import { useMemo, useState } from "react";
import { formatGBP } from "@/lib/format";
import type { Order, FulfilmentStatus } from "@/lib/types";

const FULFILMENT: FulfilmentStatus[] = [
  "none",
  "new",
  "packed",
  "shipped",
  "delivered",
];

function toCSV(rows: Order[]): string {
  const head = [
    "id",
    "date",
    "name",
    "email",
    "item_type",
    "amount_gbp",
    "status",
    "fulfilment",
    "tracking",
  ];
  const body = rows.map((o) =>
    [
      o.id,
      new Date(o.created_at).toISOString(),
      o.name ?? "",
      o.email,
      o.item_type,
      o.amount_gbp,
      o.status,
      o.fulfilment_status,
      o.tracking_number ?? "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [head.join(","), ...body].join("\n");
}

export function OrdersManager({ initial }: { initial: Order[] }) {
  const [rows, setRows] = useState<Order[]>(initial);
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((o) => {
      if (from && new Date(o.created_at) < new Date(from)) return false;
      if (to && new Date(o.created_at) > new Date(to + "T23:59:59")) return false;
      if (!q) return true;
      return (
        (o.name || "").toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [rows, search, from, to]);

  function open(o: Order) {
    setSelected(o);
    setTracking(o.tracking_number || "");
  }

  async function updateFulfilment(status: FulfilmentStatus) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selected.id,
          fulfilment_status: status,
          tracking_number: tracking || null,
        }),
      });
      if (res.ok) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === selected.id
              ? { ...r, fulfilment_status: status, tracking_number: tracking || null }
              : r
          )
        );
        setSelected((s) =>
          s ? { ...s, fulfilment_status: status, tracking_number: tracking || null } : s
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const blob = new Blob([toCSV(filtered)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, order id"
            className="field max-w-xs"
          />
          <div>
            <label className="label mb-1 block">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field" />
          </div>
          <div>
            <label className="label mb-1 block">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field" />
          </div>
        </div>
        <button onClick={exportCsv} className="btn btn-secondary text-sm">
          Export CSV
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-line">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted">No orders in this range.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Fulfilment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => open(o)}
                  className="cursor-pointer hover:bg-peach/40"
                >
                  <td className="px-4 py-3">
                    {new Date(o.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 font-bold">{o.name || o.email}</td>
                  <td className="px-4 py-3 tabular-nums">{formatGBP(o.amount_gbp)}</td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                  <td className="px-4 py-3 capitalize">{o.fulfilment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSelected(null)} />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-shell p-6">
            <div className="flex items-start justify-between">
              <h3>Order</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-muted"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Customer" value={selected.name || "—"} />
              <Row label="Email" value={selected.email} />
              <Row label="Amount" value={formatGBP(selected.amount_gbp)} />
              <Row label="Payment" value={selected.status} />
              <Row label="Type" value={selected.item_type} />
              {selected.stripe_session_id && (
                <Row label="Stripe session" value={selected.stripe_session_id} />
              )}
              {selected.shipping_address && (
                <Row
                  label="Shipping"
                  value={Object.values(selected.shipping_address)
                    .filter(Boolean)
                    .join(", ")}
                />
              )}
            </dl>

            <div className="mt-6">
              <label className="label mb-2 block">Tracking number</label>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Add before marking as shipped"
                className="field"
              />
            </div>

            <div className="mt-4">
              <label className="label mb-2 block">Fulfilment</label>
              <div className="flex flex-wrap gap-2">
                {FULFILMENT.map((s) => (
                  <button
                    key={s}
                    disabled={saving}
                    onClick={() => updateFulfilment(s)}
                    className={`pill border capitalize ${
                      selected.fulfilment_status === s
                        ? "bg-clay text-shell border-clay"
                        : "border-line text-ink hover:border-clay"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                Marking as Shipped emails the customer their tracking number.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="break-words">{value}</dd>
    </div>
  );
}
