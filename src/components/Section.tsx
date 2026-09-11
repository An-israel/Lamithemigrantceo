import { clsx } from "@/lib/clsx";

type Background = "shell" | "peach" | "ink" | "clay" | "gold";

const bgClass: Record<Background, string> = {
  shell: "bg-shell text-ink",
  peach: "bg-peach text-ink",
  ink: "bg-ink text-shell",
  clay: "bg-clay text-shell",
  gold: "bg-gold-bg text-ink",
};

/**
 * The site's rhythm primitive. Rotate through the 4 brand tones (shell/ink/
 * clay/gold) down a page so no two adjacent sections share a background —
 * `peach` stays available for a lighter secondary neutral where needed.
 * Vertical rhythm: 72px mobile, 120px desktop. Content maxes at 1140px.
 */
export function Section({
  background = "shell",
  className,
  containerClassName,
  children,
  id,
}: {
  background?: Background;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={clsx("py-[72px] md:py-[120px]", bgClass[background], className)}
    >
      <div
        className={clsx(
          "mx-auto max-w-content px-5 md:px-10",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
