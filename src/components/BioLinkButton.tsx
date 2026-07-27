"use client";

import { createClient } from "@/lib/supabase/client";
import type { BioLink } from "@/lib/types";

/**
 * A single link-in-bio button. Records a click via the increment_bio_click
 * RPC (best-effort) before navigating, so /admin/links shows real numbers.
 */
export function BioLinkButton({ link }: { link: BioLink }) {
  const external = /^https?:\/\//.test(link.url);

  async function track() {
    // Only real DB rows (uuid) can be tracked; seed ids are ignored server-side.
    try {
      const supabase = createClient();
      await supabase.rpc("increment_bio_click", { link_id: link.id });
    } catch {
      /* best-effort */
    }
  }

  return (
    <a
      href={link.url}
      onClick={track}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="block rounded-card border border-shell/25 bg-shell/5 px-6 py-4 no-underline transition-colors hover:border-gold hover:bg-shell/10"
    >
      <span className="block font-bold text-shell">{link.label}</span>
      {link.description && (
        <span className="mt-0.5 block text-sm text-shell/60">
          {link.description}
        </span>
      )}
    </a>
  );
}
