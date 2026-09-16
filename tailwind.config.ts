import type { Config } from "tailwindcss";

/**
 * Brand tokens mirror the CSS custom properties defined in globals.css.
 * Rule from the brief: never pure black, never pure white, never grey.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x-rgb) / <alpha-value>) lets Tailwind generate real
        // opacity-modified utilities (text-shell/60, bg-ink/10, ...) — a
        // bare var(--shell) reference can't take an alpha channel, so those
        // utilities would otherwise silently produce no CSS at all.
        shell: "rgb(var(--shell-rgb) / <alpha-value>)",
        peach: "rgb(var(--peach-rgb) / <alpha-value>)",
        "peach-deep": "rgb(var(--peach-deep-rgb) / <alpha-value>)",
        clay: "rgb(var(--clay-rgb) / <alpha-value>)",
        "clay-deep": "rgb(var(--clay-deep-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        jade: "rgb(var(--jade-rgb) / <alpha-value>)",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        gold: "rgb(var(--gold-rgb) / <alpha-value>)",
        "gold-soft": "rgb(var(--gold-soft-rgb) / <alpha-value>)",
        "gold-bg": "rgb(var(--gold-bg-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-karla)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1140px",
        prose: "68ch",
      },
      borderRadius: {
        input: "4px",
        card: "12px",
        pill: "999px",
      },
      fontSize: {
        label: ["12px", { lineHeight: "1.2", letterSpacing: "0.12em" }],
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-rise": "fade-rise 400ms ease both",
      },
      boxShadow: {
        // The single permitted soft shadow, reserved for the primary buy button.
        buy: "0 6px 20px -8px rgba(14, 77, 58, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
