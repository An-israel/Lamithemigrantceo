/**
 * §6.1 authority strip / §4 verified brand facts.
 * Wording follows the brief exactly: "over 500 directly supported" and
 * "impact approaching 1,000" — never claim 1,000 as an exact confirmed number.
 * TODO(lami): update figures before launch if newer verified numbers exist.
 */
const FACTS = [
  { figure: "500+", label: "directly supported" },
  { figure: "~24,000", label: "followers" },
  { figure: "10+ years", label: "in business" },
  { figure: "Founder", label: "speaker & movement builder" },
];

export function AuthorityStrip() {
  return (
    <div className="bg-ink text-shell">
      <div className="mx-auto grid max-w-content grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4 md:px-10">
        {FACTS.map((f) => (
          <div key={f.label} className="text-center">
            <p className="font-display text-3xl font-bold text-gold-soft md:text-4xl">
              {f.figure}
            </p>
            <p className="label mt-1 text-shell/70">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
