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
        shell: "var(--shell)",
        peach: "var(--peach)",
        "peach-deep": "var(--peach-deep)",
        clay: "var(--clay)",
        "clay-deep": "var(--clay-deep)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        jade: "var(--jade)",
        line: "var(--line)",
        gold: "var(--gold)",
        "gold-soft": "var(--gold-soft)",
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
