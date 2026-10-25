"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { campaignEmail, personalize } from "@/lib/emailTemplates";
import { campaignProblem } from "@/lib/campaignRules";
import { clsx } from "@/lib/clsx";
import type { EmailCampaign, EmailCampaignRecipient } from "@/lib/types";

type Editable = Pick<
  EmailCampaign,
  "name" | "subject" | "preview_text" | "body_html" | "image_url" | "cta_label" | "cta_url"
>;

type Progress = {
  status: EmailCampaign["status"];
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  remaining: number;
  paused?: string;
  retryAfterMs?: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function fmt(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
}

export function CampaignEditor({
  initial,
  subscriberCount,
  adminEmail,
  problems,
}: {
  initial: EmailCampaign;
  subscriberCount: number;
  adminEmail: string;
  problems: EmailCampaignRecipient[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<EmailCampaign["status"]>(initial.status);
  const [form, setForm] = useState<Editable>({
    name: initial.name,
    subject: initial.subject,
    preview_text: initial.preview_text,
    body_html: initial.body_html,
    image_url: initial.image_url,
    cta_label: initial.cta_label,
    cta_url: initial.cta_url,
  });
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const dirty = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef(form);
  formRef.current = form;

  const [previewWidth, setPreviewWidth] = useState<"desktop" | "mobile">("desktop");
  const [testTo, setTestTo] = useState(adminEmail);
  const [testState, setTestState] = useState<{ kind: "idle" | "sending" | "ok" | "error"; message?: string }>({ kind: "idle" });
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Progress>({
    status: initial.status,
    total: initial.recipient_count,
    sent: initial.sent_count,
    failed: initial.failed_count,
    skipped: initial.skipped_count,
    remaining: Math.max(0, initial.recipient_count - initial.sent_count - initial.failed_count - initial.skipped_count),
    paused: initial.status === "sending" ? initial.last_error || undefined : undefined,
  });
  const stop = useRef(false);

  const editable = status === "draft";
  const problem = campaignProblem(form);

  const save = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (!dirty.current) return true;
    dirty.current = false;
    setSaveState("saving");
    const f = formRef.current;
    const { error } = await createClient()
      .from("email_campaigns")
      .update({
        ...f,
        name: f.name.trim() || "Untitled email",
        cta_label: f.cta_label?.trim() || null,
        cta_url: f.cta_url?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", initial.id)
      .eq("status", "draft");
    if (error) {
      dirty.current = true;
      setSaveState("error");
      return false;
    }
    setSaveState(dirty.current ? "unsaved" : "saved");
    return true;
  }, [initial.id]);

  function set<K extends keyof Editable>(key: K, value: Editable[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    dirty.current = true;
    setSaveState("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1200);
  }

  // Don't lose edits or interrupt a send by closing the tab.
  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      if (dirty.current || running) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  const previewHtml = useMemo(
    () =>
      campaignEmail(
        {
          subject: form.subject,
          previewText: form.preview_text,
          bodyHtml: form.body_html || "<p>Start writing your email on the left.</p>",
          imageUrl: form.image_url,
          ctaLabel: form.cta_label,
          ctaUrl: form.cta_url,
        },
        { firstName: "Amaka", unsubscribeUrl: "#" }
      ).html,
    [form]
  );

  async function sendTest() {
    setTestState({ kind: "sending" });
    if (!(await save())) {
      setTestState({ kind: "error", message: "Couldn't save your latest changes. Try again." });
      return;
    }
    try {
      const res = await fetch(`/api/admin/campaigns/${initial.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      setTestState(res.ok ? { kind: "ok", message: data.message } : { kind: "error", message: data.error || "The test didn't send." });
    } catch {
      setTestState({ kind: "error", message: "Couldn't reach the site. Check your connection." });
    }
  }

  async function runSend() {
    if (running) return;
    setRunning(true);
    stop.current = false;
    setProgress((p) => ({ ...p, paused: undefined }));
    let failures = 0;
    while (!stop.current) {
      let out: Progress | null = null;
      try {
        const res = await fetch(`/api/admin/campaigns/${initial.id}/send-batch`, { method: "POST" });
        if (res.ok) out = (await res.json()) as Progress;
      } catch {
        out = null;
      }
      if (!out) {
        failures += 1;
        if (failures >= 3) {
          setProgress((p) => ({ ...p, paused: "Lost connection to the site. Nothing was lost. Press Resume to carry on." }));
          break;
        }
        await sleep(2000);
        continue;
      }
      failures = 0;
      setProgress(out);
      setStatus(out.status);
      if (out.paused || out.status === "sent") break;
      await sleep(out.retryAfterMs ?? 700);
    }
    setRunning(false);
    router.refresh();
  }

  async function startSending() {
    setActionError("");
    if (!(await save())) {
      setActionError("Couldn't save your latest changes. Try again.");
      return;
    }
    const res = await fetch(`/api/admin/campaigns/${initial.id}/start`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string; recipients?: number };
    if (!res.ok) {
      setActionError(data.error || "Couldn't start sending.");
      return;
    }
    setConfirming(false);
    setStatus("sending");
    setProgress({ status: "sending", total: data.recipients ?? subscriberCount, sent: 0, failed: 0, skipped: 0, remaining: data.recipients ?? subscriberCount });
    runSend();
  }

  async function retryFailed() {
    setActionError("");
    const res = await fetch(`/api/admin/campaigns/${initial.id}/retry-failed`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string; retrying?: number };
    if (!res.ok) {
      setActionError(data.error || "Couldn't retry.");
      return;
    }
    if (data.retrying) {
      setStatus("sending");
      runSend();
    }
  }

  async function duplicate() {
    const { data, error } = await createClient()
      .from("email_campaigns")
      .insert({
        name: `Copy of ${form.name}`.slice(0, 120),
        subject: form.subject,
        preview_text: form.preview_text,
        body_html: form.body_html,
        image_url: form.image_url,
        cta_label: form.cta_label,
        cta_url: form.cta_url,
      })
      .select("id")
      .single();
    if (error || !data) {
      setActionError("Couldn't make a copy.");
      return;
    }
    router.push(`/admin/campaigns/${(data as { id: string }).id}`);
  }

  async function remove() {
    if (!window.confirm("Delete this draft? This can't be undone.")) return;
    dirty.current = false;
    const { error } = await createClient().from("email_campaigns").delete().eq("id", initial.id).eq("status", "draft");
    if (error) {
      setActionError("Couldn't delete the draft.");
      return;
    }
    router.push("/admin/campaigns");
    router.refresh();
  }

  const done = progress.sent + progress.failed + progress.skipped;
  const pct = progress.total ? Math.round((done / progress.total) * 100) : 0;

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editable ? (
            <input
              id="campaign-name"
              aria-label="Email name (only you see this)"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full bg-transparent font-display text-3xl font-semibold text-ink outline-none focus:underline"
            />
          ) : (
            <h1 className="text-3xl">{form.name}</h1>
          )}
          <p className="mt-1 text-sm text-muted">
            {status === "draft" && (
              <>
                Draft ·{" "}
                <span className={clsx(saveState === "error" && "text-[#9b2c1f]")}>
                  {saveState === "saving" ? "Saving…" : saveState === "unsaved" ? "Unsaved changes" : saveState === "error" ? "Couldn't save. Check your connection." : "All changes saved"}
                </span>
              </>
            )}
            {status === "sending" && (running ? "Sending now…" : `Started ${fmt(initial.started_at)}, not finished`)}
            {status === "sent" && `Sent ${fmt(initial.sent_at) || "just now"}`}
          </p>
        </div>
        <div className="flex gap-2">
          {status !== "draft" && (
            <button onClick={duplicate} className="btn btn-secondary text-sm">
              Duplicate as new draft
            </button>
          )}
          {status === "draft" && (
            <button onClick={remove} className="text-sm text-[#9b2c1f] underline">
              Delete draft
            </button>
          )}
        </div>
      </div>

      {actionError && <p className="mt-4 rounded-card border border-[#9b2c1f] bg-[#9b2c1f]/5 p-3 text-sm text-[#9b2c1f]">{actionError}</p>}

      {/* Progress / report */}
      {status !== "draft" && (
        <section className="mt-6 rounded-card border border-line bg-shell p-5" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3>{status === "sent" ? "Results" : "Sending"}</h3>
            <span className="text-sm tabular-nums text-muted">
              {done} of {progress.total} done
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-peach-deep" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-jade transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Sent", progress.sent],
              ["Failed", progress.failed],
              ["Skipped", progress.skipped],
              ["Waiting", progress.remaining],
            ].map(([label, n]) => (
              <div key={label as string} className="rounded-input bg-peach/60 p-3">
                <dt className="label">{label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{n}</dd>
              </div>
            ))}
          </dl>
          {progress.paused && !running && (
            <p className="mt-4 rounded-input border border-gold bg-gold/10 p-3 text-sm text-ink">{progress.paused}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {status === "sending" && !running && (
              <button onClick={runSend} className="btn btn-primary text-sm">
                Resume sending
              </button>
            )}
            {running && (
              <button onClick={() => (stop.current = true)} className="btn btn-secondary text-sm">
                Pause
              </button>
            )}
            {status === "sent" && progress.failed > 0 && !running && (
              <button onClick={retryFailed} className="btn btn-primary text-sm">
                Retry {progress.failed} failed
              </button>
            )}
          </div>
          {running && <p className="mt-3 text-xs text-muted">Keep this page open until it finishes. If you close it, press Resume later; nobody gets the email twice.</p>}
          {status === "sent" && (
            <p className="mt-3 text-xs text-muted">
              &ldquo;Sent&rdquo; means Resend accepted the email. Skipped people unsubscribed after you pressed send.
            </p>
          )}
          {problems.length > 0 && !running && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-bold">Who didn&rsquo;t get it ({problems.length})</summary>
              <ul className="mt-2 divide-y divide-line rounded-input border border-line">
                {problems.map((p) => (
                  <li key={p.email} className="flex flex-wrap gap-x-3 p-2">
                    <span className="font-mono text-xs">{p.email}</span>
                    <span className="text-xs text-muted">
                      {p.status}: {p.error || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Form, or a summary once it has gone out */}
        {!editable ? (
          <dl className="space-y-4 text-sm">
            {[
              ["Subject line", form.subject],
              ["Preview text", form.preview_text || "None"],
              ["Header image", form.image_url ? "Included" : "None"],
              ["Button", form.cta_label && form.cta_url ? `${form.cta_label} → ${form.cta_url}` : "None"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="label">{label}</dt>
                <dd className="mt-1 break-words text-ink">{value}</dd>
              </div>
            ))}
            <p className="text-xs text-muted">Sent emails can&rsquo;t be changed. Duplicate it to send an updated version.</p>
          </dl>
        ) : (
        <div className="space-y-5">
          <div>
            <label htmlFor="campaign-subject" className="label mb-1 block">
              Subject line
            </label>
            <input
              id="campaign-subject"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              maxLength={150}
              placeholder="e.g. How I'd start with £200 today"
              className="field"
            />
            <p className="mt-1 text-xs text-muted">Keep it under about 50 characters so it isn&rsquo;t cut off on phones.</p>
          </div>
          <div>
            <label htmlFor="campaign-preview" className="label mb-1 block">
              Preview text <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="campaign-preview"
              value={form.preview_text}
              onChange={(e) => set("preview_text", e.target.value)}
              maxLength={150}
              placeholder="The line people see next to the subject in their inbox"
              className="field"
            />
          </div>
          <div>
            <span className="label mb-1 block">Header image (optional)</span>
            <ImageUploader value={form.image_url} onChange={(url) => set("image_url", url || null)} folder="email" aspect="aspect-[16/9]" />
          </div>
          <div>
            <span className="label mb-1 block">Email</span>
            <RichTextEditor value={form.body_html} onChange={(html) => set("body_html", html)} />
            <p className="mt-1 text-xs text-muted">
              Type <code>{"{{first_name}}"}</code> to greet each person by name. It becomes &ldquo;there&rdquo; when we
              don&rsquo;t know their name. You don&rsquo;t need to sign off: &ldquo;Lami&rdquo; and an unsubscribe link are
              added automatically.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="campaign-cta-label" className="label mb-1 block">
                Button text (optional)
              </label>
              <input
                id="campaign-cta-label"
                value={form.cta_label || ""}
                onChange={(e) => set("cta_label", e.target.value)}
                placeholder="e.g. Get the guide"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="campaign-cta-url" className="label mb-1 block">
                Button link
              </label>
              <input
                id="campaign-cta-url"
                value={form.cta_url || ""}
                onChange={(e) => set("cta_url", e.target.value)}
                placeholder="https://lamithemigrantceo.uk/…"
                className="field"
              />
            </div>
          </div>

          <section className="rounded-card border border-line p-4">
            <h3 className="text-lg">Send a test</h3>
            <p className="mt-1 text-sm text-muted">See exactly how it looks in a real inbox before anyone else gets it.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="campaign-test-to" className="sr-only">
                Test email address
              </label>
              <input
                id="campaign-test-to"
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                className="field"
              />
              <button onClick={sendTest} disabled={testState.kind === "sending" || !form.subject.trim()} className="btn btn-secondary shrink-0 text-sm">
                {testState.kind === "sending" ? "Sending…" : "Send test"}
              </button>
            </div>
            {testState.message && (
              <p role="status" className={clsx("mt-2 text-sm", testState.kind === "ok" ? "text-jade" : "text-[#9b2c1f]")}>
                {testState.message}
              </p>
            )}
          </section>

          <section className="rounded-card border-2 border-clay p-4">
            <h3 className="text-lg">Send to your list</h3>
            {problem ? (
              <p className="mt-1 text-sm text-muted">Before you can send: {problem}</p>
            ) : subscriberCount === 0 ? (
              <p className="mt-1 text-sm text-muted">Your list is empty. Add subscribers first.</p>
            ) : !confirming ? (
              <>
                <p className="mt-1 text-sm text-muted">
                  Goes to everyone subscribed right now: <strong className="text-ink">{subscriberCount}</strong>{" "}
                  {subscriberCount === 1 ? "person" : "people"}.
                </p>
                <button onClick={() => setConfirming(true)} className="btn btn-primary mt-3 text-sm">
                  Send to {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}
                </button>
              </>
            ) : (
              <div className="mt-2 space-y-3 text-sm">
                <p>
                  Send <strong>&ldquo;{form.subject}&rdquo;</strong> to <strong>{subscriberCount}</strong>{" "}
                  {subscriberCount === 1 ? "person" : "people"} now? You can&rsquo;t unsend it.
                </p>
                {testState.kind !== "ok" && <p className="text-muted">Tip: send yourself a test first.</p>}
                <div className="flex flex-wrap gap-2">
                  <button onClick={startSending} className="btn btn-primary text-sm">
                    Yes, send it now
                  </button>
                  <button onClick={() => setConfirming(false)} className="btn btn-secondary text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
        )}

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between">
            <span className="label">Preview</span>
            <div className="flex gap-1 text-xs" role="group" aria-label="Preview width">
              {(["desktop", "mobile"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setPreviewWidth(w)}
                  aria-pressed={previewWidth === w}
                  className={clsx("rounded-pill px-3 py-1", previewWidth === w ? "bg-ink text-shell" : "text-muted hover:text-ink")}
                >
                  {w === "desktop" ? "Desktop" : "Phone"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 rounded-card border border-line bg-peach/50 p-3">
            <p className="truncate text-sm">
              <strong>{form.subject ? personalize(form.subject, "Amaka") : "No subject yet"}</strong>
              {form.preview_text && <span className="text-muted"> — {personalize(form.preview_text, "Amaka")}</span>}
            </p>
            <iframe
              title="Email preview"
              sandbox=""
              srcDoc={previewHtml}
              className={clsx("mx-auto mt-3 block h-[640px] rounded-input border border-line bg-shell transition-all", previewWidth === "mobile" ? "w-[375px] max-w-full" : "w-full")}
            />
            <p className="mt-2 text-xs text-muted">Shown as it looks for a subscriber named Amaka.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
