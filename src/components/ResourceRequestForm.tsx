"use client";

import { useState } from "react";
import { toEmbedUrl } from "@/lib/embed";
import type { Resource } from "@/lib/types";

/**
 * Email-gated access to a resource. Records the request as an enquiry
 * (topic "Resource") so it shows up in /admin/enquiries, and unlocks the
 * file/video immediately when one exists rather than waiting on Lami to send
 * it by hand.
 */
export function ResourceRequestForm({ resource }: { resource: Resource }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Resource request",
          email,
          topic: "Resource",
          message: `Requested: ${resource.title}`,
          marketing_opt_in: true,
          source_page: `/resources#${resource.id}`,
        }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    if (resource.file_url) {
      return (
        <a
          href={resource.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary mt-4 w-fit text-sm"
        >
          Download now
        </a>
      );
    }
    if (resource.video_url) {
      const embed = toEmbedUrl(resource.video_url);
      return embed ? (
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-card">
          <iframe
            src={embed}
            title={resource.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={resource.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary mt-4 w-fit text-sm"
        >
          Watch now
        </a>
      );
    }
    return (
      <p className="mt-4 text-sm text-jade">
        Got it. Lami will send this to your inbox shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <div className="flex gap-2">
        <label htmlFor={`res-${resource.id}`} className="sr-only">
          Email address
        </label>
        <input
          id={`res-${resource.id}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="field text-sm"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="btn btn-secondary shrink-0 text-sm"
        >
          {state === "sending" ? "Sending…" : "Get it free"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-1 text-xs text-clay">That didn&rsquo;t go through.</p>
      )}
    </form>
  );
}
