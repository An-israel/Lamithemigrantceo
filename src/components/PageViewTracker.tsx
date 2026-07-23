"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Cookieless page-view logging. Sends the path + referrer to /api/pageview on
 * every navigation. No cookies, no IP stored — a per-tab session id is kept in
 * sessionStorage only. Admin routes are not tracked.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    let sid = "";
    try {
      sid = sessionStorage.getItem("gbg-sid") || "";
      if (!sid) {
        sid =
          (crypto.randomUUID?.() ?? String(Math.random())).replace(/-/g, "");
        sessionStorage.setItem("gbg-sid", sid);
      }
    } catch {
      // sessionStorage unavailable — send without a session id
    }

    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
      session: sid,
    });

    // Prefer sendBeacon so it survives navigation.
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/pageview",
          new Blob([body], { type: "application/json" })
        );
        return;
      }
    } catch {
      // fall through to fetch
    }
    fetch("/api/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
