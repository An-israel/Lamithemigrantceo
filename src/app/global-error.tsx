"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown by the root layout itself (fonts, providers), where
 * the regular error.tsx boundary can't help because it renders inside that
 * same layout. Must render its own <html>/<body> — no shared components.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#F8F6F0",
          color: "#17140E",
        }}
      >
        <div style={{ textAlign: "center", padding: "24px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0E4D3A" }}>
            Something went wrong
          </p>
          <h1 style={{ marginTop: 12, fontSize: 28 }}>The site hit a snag.</h1>
          <p style={{ marginTop: 12, color: "#6E6658" }}>
            Please try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: "#0E4D3A",
              color: "#F8F6F0",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
