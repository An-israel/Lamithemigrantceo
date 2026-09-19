/**
 * Registry of every site-wide editable text field: a stable key, a label
 * for the admin editor, and the default value (the copy already hardcoded
 * on the page). A key with no row in `site_content` yet renders its
 * default — nothing changes until an admin actually edits it in
 * /admin/content. Add a page's fields here as it gets converted; pages
 * not yet listed keep their copy hardcoded in JSX as before.
 */
export type ContentField = {
  key: string;
  label: string;
  type: "text" | "textarea";
  default: string;
};

export type ContentGroup = {
  id: string;
  label: string;
  fields: ContentField[];
};

export const CONTENT_REGISTRY: ContentGroup[] = [
  {
    id: "home",
    label: "Homepage",
    fields: [
      { key: "home.hero.kicker", label: "Hero eyebrow", type: "text", default: "Lami, The Migrant CEO" },
      {
        key: "home.story.heading",
        label: "“I rebuilt my life” heading",
        type: "text",
        default: "I rebuilt my life, so you can build yours.",
      },
      {
        key: "home.story.paragraph1",
        label: "“I rebuilt my life” paragraph 1",
        type: "textarea",
        default:
          "I built and ran businesses in Nigeria for years. In 2022 I moved to the United Kingdom and started again: new country, new rules, and less than £200 to my name. From there I built product businesses, a warehouse wholesale operation, an education programme and a community of women doing the same.",
      },
      {
        key: "home.story.paragraph2",
        label: "“I rebuilt my life” paragraph 2",
        type: "textarea",
        default:
          "From starting again to building an ecosystem. Business ownership is the beginning. Wealth and legacy are the destination.",
      },
      {
        key: "home.paths.heading",
        label: "“What are you here to build” heading",
        type: "text",
        default: "What are you here to build?",
      },
      {
        key: "home.paths.subtext",
        label: "“What are you here to build” subtext",
        type: "textarea",
        default: "Pick the path that fits where you are. Each one points you to the right next step.",
      },
      {
        key: "home.ecosystem.heading",
        label: "“One founder” heading",
        type: "text",
        default: "One founder. A whole ecosystem.",
      },
      {
        key: "home.ecosystem.subtext",
        label: "“One founder” subtext",
        type: "textarea",
        default: "Education, wholesale, community and live events, built to move you from income to ownership.",
      },
      {
        key: "home.impact.heading",
        label: "“Real people” heading",
        type: "text",
        default: "Real people. Real businesses.",
      },
      { key: "home.video.kicker", label: "Story-video eyebrow", type: "text", default: "Watch my story" },
      {
        key: "home.video.heading",
        label: "Story-video heading",
        type: "text",
        default: "From starting again to building an ecosystem.",
      },
      {
        key: "home.video.paragraph",
        label: "Story-video paragraph",
        type: "textarea",
        default: "A short introduction to the journey: migration, rebuilding, and the movement it became.",
      },
      {
        key: "home.speaking.paragraph",
        label: "Speaking card text",
        type: "textarea",
        default: "Keynotes, panels and workshops on migration, rebuilding, and building businesses, wealth and legacy.",
      },
      {
        key: "home.partnerships.paragraph",
        label: "Partnerships card text",
        type: "textarea",
        default: "Brand, media and institutional partnerships that reach an engaged African migrant-business audience.",
      },
      { key: "home.buildletter.heading", label: "Build Letter heading", type: "text", default: "The Build Letter." },
      {
        key: "home.buildletter.subtext",
        label: "Build Letter subtext",
        type: "textarea",
        default: "Practical business, wealth and legacy insights, straight to your inbox. No fluff, no filler.",
      },
      {
        key: "home.finalcta.heading",
        label: "Final CTA heading",
        type: "text",
        default: "Your next chapter can start here.",
      },
    ],
  },
];

export const CONTENT_DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_REGISTRY.flatMap((g) => g.fields.map((f) => [f.key, f.default]))
);

/** Returns the saved value for `key`, or its registered default if unset/blank. */
export function content(map: Record<string, string>, key: string): string {
  const v = map[key];
  if (v && v.trim()) return v;
  return CONTENT_DEFAULTS[key] ?? "";
}
