"use client";

import { useRouter } from "next/navigation";

const OPTIONS: { key: string; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "All time" },
];

export function RangePicker({ current }: { current: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          onClick={() => router.push(`/admin/analytics?range=${o.key}`)}
          className={`pill border text-sm ${
            current === o.key
              ? "bg-clay text-shell border-clay"
              : "border-line text-ink hover:border-clay"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
