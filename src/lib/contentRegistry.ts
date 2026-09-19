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
      { key: "home.paths.0.title", label: "Path 1 — title", type: "text", default: "Start a business" },
      {
        key: "home.paths.0.body",
        label: "Path 1 — body",
        type: "textarea",
        default: "You have ambition and a little to start with. Get the first steps.",
      },
      { key: "home.paths.0.cta", label: "Path 1 — button label", type: "text", default: "Start Here" },
      { key: "home.paths.1.title", label: "Path 2 — title", type: "text", default: "Grow a product business" },
      {
        key: "home.paths.1.body",
        label: "Path 2 — body",
        type: "textarea",
        default: "You are selling already and need stock, systems and scale.",
      },
      { key: "home.paths.1.cta", label: "Path 2 — button label", type: "text", default: "Visit the Wholesale Hub" },
      { key: "home.paths.2.title", label: "Path 3 — title", type: "text", default: "Join the community" },
      {
        key: "home.paths.2.body",
        label: "Path 3 — body",
        type: "textarea",
        default: "Build alongside other African women, not in isolation.",
      },
      { key: "home.paths.2.cta", label: "Path 3 — button label", type: "text", default: "Join the Movement" },
      { key: "home.paths.3.title", label: "Path 4 — title", type: "text", default: "Book Lami" },
      {
        key: "home.paths.3.body",
        label: "Path 4 — body",
        type: "textarea",
        default: "A speaker who moves an audience to action, not just applause.",
      },
      { key: "home.paths.3.cta", label: "Path 4 — button label", type: "text", default: "See Speaking" },
      { key: "home.paths.4.title", label: "Path 5 — title", type: "text", default: "Explore resources" },
      {
        key: "home.paths.4.body",
        label: "Path 5 — body",
        type: "textarea",
        default: "Free guides and The Build Letter to get moving today.",
      },
      { key: "home.paths.4.cta", label: "Path 5 — button label", type: "text", default: "Get Resources" },
      { key: "home.ecosystem.0.name", label: "Ecosystem 1 — name", type: "text", default: "GBG Wholesale Hub" },
      {
        key: "home.ecosystem.0.body",
        label: "Ecosystem 1 — body",
        type: "textarea",
        default: "Wholesale inventory and product opportunities for resellers and product-business owners.",
      },
      { key: "home.ecosystem.0.cta", label: "Ecosystem 1 — link label", type: "text", default: "Visit the Wholesale Hub" },
      { key: "home.ecosystem.1.name", label: "Ecosystem 2 — name", type: "text", default: "African Women Builds" },
      {
        key: "home.ecosystem.1.body",
        label: "Ecosystem 2 — body",
        type: "textarea",
        default: "A community and movement helping African women build businesses, wealth and legacy.",
      },
      { key: "home.ecosystem.1.cta", label: "Ecosystem 2 — link label", type: "text", default: "Join the Movement" },
      { key: "home.ecosystem.2.name", label: "Ecosystem 3 — name", type: "text", default: "GBG Academy" },
      {
        key: "home.ecosystem.2.body",
        label: "Ecosystem 3 — body",
        type: "textarea",
        default: "Practical business education for people starting and growing product businesses.",
      },
      { key: "home.ecosystem.2.cta", label: "Ecosystem 3 — link label", type: "text", default: "Explore Products" },
      { key: "home.ecosystem.3.name", label: "Ecosystem 4 — name", type: "text", default: "Build Her Empire Live" },
      {
        key: "home.ecosystem.3.body",
        label: "Ecosystem 4 — body",
        type: "textarea",
        default: "The flagship in-person experience for ambitious African women business owners.",
      },
      { key: "home.ecosystem.3.cta", label: "Ecosystem 4 — link label", type: "text", default: "View the Event" },
      { key: "home.impact.0.figure", label: "Impact stat 1 — figure", type: "text", default: "30" },
      { key: "home.impact.0.label", label: "Impact stat 1 — label", type: "text", default: "units sold out" },
      { key: "home.impact.1.figure", label: "Impact stat 2 — figure", type: "text", default: "£1,000+" },
      { key: "home.impact.1.label", label: "Impact stat 2 — label", type: "text", default: "first-revenue milestone" },
      { key: "home.impact.2.figure", label: "Impact stat 3 — figure", type: "text", default: "50" },
      { key: "home.impact.2.label", label: "Impact stat 3 — label", type: "text", default: "products sold" },
    ],
  },
  {
    id: "about",
    label: "About page",
    fields: [
      { key: "about.hero.heading", label: "Heading", type: "text", default: "The Story Behind The Migrant CEO" },
      {
        key: "about.bio.lead",
        label: "Opening line",
        type: "textarea",
        default: "Temitope Olamide Oni Mole, known publicly as Lami the Migrant CEO, is an entrepreneur, educator, speaker and community builder.",
      },
      {
        key: "about.bio.p1",
        label: "Paragraph 1",
        type: "textarea",
        default: "Her entrepreneurial life began in Nigeria, where she built and ran businesses and learned the real work of sales, sourcing, marketing and looking after customers: hands-on, practical experience, not theory.",
      },
      { key: "about.quote.0", label: "Pull quote 1", type: "textarea", default: "I rebuilt my life, so you can build yours." },
      {
        key: "about.bio.p2",
        label: "Paragraph 2",
        type: "textarea",
        default: "In 2022 she moved to the United Kingdom and rebuilt her identity, income and opportunity from the ground up, starting her UK business journey with less than £200 and treating that constraint as a starting line, not a ceiling.",
      },
      {
        key: "about.bio.p3",
        label: "Paragraph 3",
        type: "textarea",
        default: "From there she built product businesses, taught other entrepreneurs, formed communities and opened a warehouse in Liverpool. Along the way, helping African women build wealth became bigger than business coaching.",
      },
      {
        key: "about.quote.1",
        label: "Pull quote 2",
        type: "textarea",
        default: "Migrants do not have to abandon their ambition when they move countries.",
      },
      {
        key: "about.bio.p4",
        label: "Paragraph 4",
        type: "textarea",
        default: "Her belief is simple: migrants do not have to shrink their dream to fit a new country. The long-term vision is to become the leading global voice helping African women migrants build businesses and generational wealth.",
      },
      {
        key: "about.quote.2",
        label: "Pull quote 3",
        type: "textarea",
        default: "Business ownership is the beginning. Wealth and legacy are the destination.",
      },
      { key: "about.stats.0.figure", label: "Stat 1 — figure", type: "text", default: "500+" },
      { key: "about.stats.0.label", label: "Stat 1 — label", type: "text", default: "directly supported" },
      { key: "about.stats.1.figure", label: "Stat 2 — figure", type: "text", default: "~24,000" },
      { key: "about.stats.1.label", label: "Stat 2 — label", type: "text", default: "combined followers" },
      { key: "about.stats.2.figure", label: "Stat 3 — figure", type: "text", default: "10+ years" },
      { key: "about.stats.2.label", label: "Stat 3 — label", type: "text", default: "in business" },
      {
        key: "about.stats.caption",
        label: "Stats caption",
        type: "text",
        default: "Over 500 people directly supported; total impact approaching 1,000.",
      },
      { key: "about.finalcta.heading", label: "Final CTA heading", type: "text", default: "Your next chapter can start here." },
      { key: "about.timeline.0.year", label: "Timeline 1 — year/label", type: "text", default: "Nigeria" },
      { key: "about.timeline.0.text", label: "Timeline 1 — text", type: "textarea", default: "Built and ran businesses; developed experience in sales, sourcing, marketing and customer service." },
      { key: "about.timeline.1.year", label: "Timeline 2 — year/label", type: "text", default: "2022" },
      { key: "about.timeline.1.text", label: "Timeline 2 — text", type: "textarea", default: "Moved to the United Kingdom and began rebuilding." },
      { key: "about.timeline.2.year", label: "Timeline 3 — year/label", type: "text", default: "The restart" },
      { key: "about.timeline.2.text", label: "Timeline 3 — text", type: "textarea", default: "Started a UK business journey with less than £200." },
      { key: "about.timeline.3.year", label: "Timeline 4 — year/label", type: "text", default: "Growth" },
      { key: "about.timeline.3.text", label: "Timeline 4 — text", type: "textarea", default: "Expanded into education, wholesale, content and community." },
      { key: "about.timeline.4.year", label: "Timeline 5 — year/label", type: "text", default: "Warehouse era" },
      { key: "about.timeline.4.text", label: "Timeline 5 — text", type: "textarea", default: "Established a physical wholesale operation in Liverpool." },
      { key: "about.timeline.5.year", label: "Timeline 6 — year/label", type: "text", default: "2026" },
      { key: "about.timeline.5.text", label: "Timeline 6 — text", type: "textarea", default: "Launched African Women Builds and Build Her Empire Live." },
      { key: "about.timeline.6.year", label: "Timeline 7 — year/label", type: "text", default: "The future" },
      { key: "about.timeline.6.text", label: "Timeline 7 — text", type: "textarea", default: "Building a global movement around business ownership, assets and legacy." },
    ],
  },
  {
    id: "start-here",
    label: "Start Here page",
    fields: [
      { key: "starthere.subtext", label: "Subtext", type: "textarea", default: "One simple question so you never feel lost. Pick what fits you and I'll point you to the right next step." },
      { key: "starthere.0.q", label: "Path 1 — question", type: "text", default: "I want to start a business" },
      { key: "starthere.0.to", label: "Path 1 — answer", type: "textarea", default: "Start Your Product Biz: the self-paced route from nothing to your first paid order." },
      { key: "starthere.0.cta", label: "Path 1 — button label", type: "text", default: "Start Your Product Biz" },
      { key: "starthere.1.q", label: "Path 2 — question", type: "text", default: "I already run a product business" },
      { key: "starthere.1.to", label: "Path 2 — answer", type: "textarea", default: "The GBG Wholesale Hub and growth support." },
      { key: "starthere.1.cta", label: "Path 2 — button label", type: "text", default: "Visit the Wholesale Hub" },
      { key: "starthere.2.q", label: "Path 3 — question", type: "text", default: "I want community and collaboration" },
      { key: "starthere.2.to", label: "Path 3 — answer", type: "textarea", default: "African Women Builds: build alongside others." },
      { key: "starthere.2.cta", label: "Path 3 — button label", type: "text", default: "Join the Movement" },
      { key: "starthere.3.q", label: "Path 4 — question", type: "text", default: "I want to attend an event" },
      { key: "starthere.3.to", label: "Path 4 — answer", type: "textarea", default: "Build Her Empire Live and future events." },
      { key: "starthere.3.cta", label: "Path 4 — button label", type: "text", default: "View events" },
      { key: "starthere.4.q", label: "Path 5 — question", type: "text", default: "I want to book Lami" },
      { key: "starthere.4.to", label: "Path 5 — answer", type: "textarea", default: "Speaking and working with Lami." },
      { key: "starthere.4.cta", label: "Path 5 — button label", type: "text", default: "See speaking" },
      { key: "starthere.5.q", label: "Path 6 — question", type: "text", default: "I want free business resources" },
      { key: "starthere.5.to", label: "Path 6 — answer", type: "textarea", default: "Free guides and The Build Letter newsletter." },
      { key: "starthere.5.cta", label: "Path 6 — button label", type: "text", default: "Get resources" },
    ],
  },
  {
    id: "movement",
    label: "Movement page",
    fields: [
      { key: "movement.subtext", label: "Hero subtext", type: "textarea", default: "This is the bigger idea behind the brand and African Women Builds. A manifesto, not a sales page." },
      { key: "movement.beliefs.0.h", label: "Belief 1 — heading", type: "text", default: "Ownership is freedom" },
      { key: "movement.beliefs.0.b", label: "Belief 1 — body", type: "textarea", default: "Business ownership is a route to choice and economic freedom, not just extra income." },
      { key: "movement.beliefs.1.h", label: "Belief 2 — heading", type: "text", default: "Build together" },
      { key: "movement.beliefs.1.b", label: "Belief 2 — body", type: "textarea", default: "African women should collaborate rather than build in isolation. Collective effort compounds." },
      { key: "movement.beliefs.2.h", label: "Belief 3 — heading", type: "text", default: "Income to ownership" },
      { key: "movement.beliefs.2.b", label: "Belief 3 — body", type: "textarea", default: "Move from earning to owning: businesses, property, investments, gold and other assets." },
      { key: "movement.beliefs.3.h", label: "Belief 4 — heading", type: "text", default: "Outlive the founder" },
      { key: "movement.beliefs.3.b", label: "Belief 4 — body", type: "textarea", default: "Build companies and opportunities that keep creating value after the founder steps back." },
      { key: "movement.beliefs.4.h", label: "Belief 5 — heading", type: "text", default: "Be a visible example" },
      { key: "movement.beliefs.4.b", label: "Belief 5 — body", type: "textarea", default: "Create proof the next generation can see, so the path is obvious for those coming behind." },
      { key: "movement.beliefs.5.h", label: "Belief 6 — heading", type: "text", default: "Migrate without shrinking" },
      { key: "movement.beliefs.5.b", label: "Belief 6 — body", type: "textarea", default: "Starting again in a new country does not mean reducing the size of the dream." },
      { key: "movement.manifesto", label: "Manifesto banner quote", type: "textarea", default: "We are not building businesses simply to survive. We are building businesses that create choices, acquire assets, employ people and leave legacies." },
      { key: "movement.join.heading", label: "Join heading", type: "text", default: "Build with us." },
      { key: "movement.join.subtext", label: "Join subtext", type: "textarea", default: "African Women Builds is where this happens together. Add your name and I'll tell you the next step." },
    ],
  },
  {
    id: "ecosystem",
    label: "Ecosystem page",
    fields: [
      {
        key: "ecosystem.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Education, wholesale, community and live events: connected pieces built to move African women from income to ownership.",
      },
      { key: "ecosystem.0.name", label: "Part 1 — name", type: "text", default: "GBG Wholesale Hub" },
      { key: "ecosystem.0.body", label: "Part 1 — body", type: "textarea", default: "Vetted stock for resellers and product-business owners. Know your margin before you buy." },
      { key: "ecosystem.0.cta", label: "Part 1 — button label", type: "text", default: "Visit the Wholesale Hub" },
      { key: "ecosystem.1.name", label: "Part 2 — name", type: "text", default: "African Women Builds" },
      { key: "ecosystem.1.body", label: "Part 2 — body", type: "textarea", default: "A community and movement helping African women build businesses, wealth and legacy, together, not in isolation." },
      { key: "ecosystem.1.cta", label: "Part 2 — button label", type: "text", default: "Join the Movement" },
      { key: "ecosystem.2.name", label: "Part 3 — name", type: "text", default: "GBG Academy" },
      { key: "ecosystem.2.body", label: "Part 3 — body", type: "textarea", default: "Practical business education for people starting and growing product businesses. Real steps from someone who has done it." },
      { key: "ecosystem.2.cta", label: "Part 3 — button label", type: "text", default: "Explore Products" },
      { key: "ecosystem.3.name", label: "Part 4 — name", type: "text", default: "Build Her Empire Live" },
      { key: "ecosystem.3.body", label: "Part 4 — body", type: "textarea", default: "The flagship in-person experience for ambitious African women business owners. Liverpool, 15 August 2026." },
      { key: "ecosystem.3.cta", label: "Part 4 — button label", type: "text", default: "View the Event" },
      { key: "ecosystem.futureventures.heading", label: "Future Ventures heading", type: "text", default: "More is being built." },
      {
        key: "ecosystem.futureventures.subtext",
        label: "Future Ventures subtext",
        type: "textarea",
        default: "New businesses and innovation projects will appear here when they are ready for public launch.",
      },
    ],
  },
  {
    id: "work-with-lami",
    label: "Work With Lami page",
    fields: [
      {
        key: "workwithlami.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Founder-level experience across business, migration and community, available for the right speaking, advisory and partnership work.",
      },
      { key: "workwithlami.0.h", label: "Way 1 — heading", type: "text", default: "Speaking" },
      { key: "workwithlami.0.b", label: "Way 1 — body", type: "textarea", default: "Keynotes, panels, workshops and fireside conversations." },
      { key: "workwithlami.0.cta", label: "Way 1 — link label", type: "text", default: "See speaking topics" },
      { key: "workwithlami.1.h", label: "Way 2 — heading", type: "text", default: "Business strategy" },
      { key: "workwithlami.1.b", label: "Way 2 — body", type: "textarea", default: "Selected private sessions, VIP days or advisory work, subject to availability." },
      { key: "workwithlami.1.cta", label: "Way 2 — link label", type: "text", default: "Enquire about strategy" },
      { key: "workwithlami.2.h", label: "Way 3 — heading", type: "text", default: "Brand partnerships" },
      { key: "workwithlami.2.b", label: "Way 3 — body", type: "textarea", default: "Relevant partnerships across business, finance, migration, technology, e-commerce and women's empowerment." },
      { key: "workwithlami.2.cta", label: "Way 3 — link label", type: "text", default: "Partnership enquiry" },
      { key: "workwithlami.3.h", label: "Way 4 — heading", type: "text", default: "Media and podcasts" },
      { key: "workwithlami.3.b", label: "Way 4 — body", type: "textarea", default: "Interviews, commentary and founder-story features." },
      { key: "workwithlami.3.cta", label: "Way 4 — link label", type: "text", default: "Media enquiry" },
      { key: "workwithlami.4.h", label: "Way 5 — heading", type: "text", default: "Community & institutional partnerships" },
      { key: "workwithlami.4.b", label: "Way 5 — body", type: "textarea", default: "Universities, councils, charities, migrant organisations and entrepreneurship programmes." },
      { key: "workwithlami.4.cta", label: "Way 5 — link label", type: "text", default: "Institutional enquiry" },
      { key: "workwithlami.finalcta.heading", label: "Final CTA heading", type: "text", default: "Have something specific in mind?" },
      {
        key: "workwithlami.finalcta.subtext",
        label: "Final CTA subtext",
        type: "textarea",
        default: "Tell me what you're planning and I'll come back with the right next step.",
      },
    ],
  },
  {
    id: "speaking",
    label: "Speaking page",
    fields: [
      {
        key: "speaking.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "A credible speaker with a real story and practical expertise, for audiences of ambitious founders, migrants and women building businesses.",
      },
      { key: "speaking.topics.0", label: "Signature talk 1", type: "text", default: "Starting Again Without Starting Small: Rebuilding After Migration" },
      { key: "speaking.topics.1", label: "Signature talk 2", type: "text", default: "From Less Than £200 to a Business Ecosystem" },
      { key: "speaking.topics.2", label: "Signature talk 3", type: "text", default: "The Truth About Building a Product-Based Business in the UK" },
      { key: "speaking.topics.3", label: "Signature talk 4", type: "text", default: "How African Women Can Build Businesses, Wealth and Legacy" },
      { key: "speaking.topics.4", label: "Signature talk 5", type: "text", default: "Community, Collaboration and the Power of Collective Buying" },
      { key: "speaking.topics.5", label: "Signature talk 6", type: "text", default: "Building a Personal Brand That Creates Business Opportunities" },
      { key: "speaking.topics.6", label: "Signature talk 7", type: "text", default: "From Business Income to Asset Ownership" },
      { key: "speaking.experience.0", label: "Experience bullet 1", type: "textarea", default: "Speaker at Enry Live and Direct in Birmingham, organised by OREP Limited." },
      { key: "speaking.experience.1", label: "Experience bullet 2", type: "textarea", default: "Founder and host of Build Her Empire Live, Liverpool, 15 August 2026." },
      { key: "speaking.experience.2", label: "Experience bullet 3", type: "textarea", default: "10+ years building and running businesses across Nigeria and the UK." },
      { key: "speaking.audience.0", label: "Audience bullet 1", type: "text", default: "African women migrants and diaspora communities" },
      { key: "speaking.audience.1", label: "Audience bullet 2", type: "text", default: "Aspiring and early-stage founders" },
      { key: "speaking.audience.2", label: "Audience bullet 3", type: "text", default: "Universities, councils and entrepreneurship programmes" },
      { key: "speaking.audience.3", label: "Audience bullet 4", type: "text", default: "Women's empowerment and enterprise events" },
      { key: "speaking.cta.heading", label: "Booking CTA heading", type: "text", default: "Bring Lami to your stage." },
      {
        key: "speaking.cta.subtext",
        label: "Booking CTA subtext",
        type: "textarea",
        default: "Tell me about your event, audience and date and I'll come back with availability and options.",
      },
    ],
  },
  {
    id: "impact",
    label: "Impact page",
    fields: [
      {
        key: "impact.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Numbers matter, but so do the people behind them. Over 500 people directly supported, with total impact approaching 1,000.",
      },
      { key: "impact.outcomes.heading", label: "Outcomes heading", type: "text", default: "What that support turns into." },
      { key: "impact.outcomes.0", label: "Outcome 1", type: "textarea", default: "Businesses started after viewers watched Lami's livestreams and educational videos." },
      { key: "impact.outcomes.1", label: "Outcome 2", type: "textarea", default: "Course and mentorship outcomes across starting and scaling." },
      { key: "impact.outcomes.2", label: "Outcome 3", type: "textarea", default: "Wholesale customers who have launched or expanded product businesses." },
      { key: "impact.outcomes.3", label: "Outcome 4", type: "textarea", default: "Community member stories shared inside African Women Builds." },
      { key: "impact.stories.heading", label: "\"In their words\" heading", type: "text", default: "In their words." },
      { key: "impact.stories.subtext", label: "\"In their words\" subtext", type: "text", default: "Real businesses. Real sales. Real results." },
      { key: "impact.messages.heading", label: "\"The real messages\" heading", type: "text", default: "The real messages." },
      { key: "impact.messages.subtext", label: "\"The real messages\" subtext", type: "text", default: "Unedited proof, straight from the community." },
      { key: "impact.finalcta.heading", label: "Final CTA heading", type: "text", default: "Be the next story." },
    ],
  },
  {
    id: "gallery",
    label: "Gallery page",
    fields: [
      {
        key: "gallery.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Events, the warehouse, and life behind the scenes.",
      },
    ],
  },
  {
    id: "resources",
    label: "Resources page",
    fields: [
      {
        key: "resources.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Practical guides you can use today, plus The Build Letter for ongoing insights. Grab what you need.",
      },
      { key: "resources.buildletter.heading", label: "Build Letter heading", type: "text", default: "Get the guides and the insights." },
      {
        key: "resources.buildletter.subtext",
        label: "Build Letter subtext",
        type: "textarea",
        default: "Join The Build Letter and I'll send practical business, wealth and legacy insights, plus the free resources above.",
      },
      { key: "resources.journal.heading", label: "\"Prefer to read\" heading", type: "text", default: "Prefer to read?" },
      {
        key: "resources.journal.subtext",
        label: "\"Prefer to read\" subtext",
        type: "textarea",
        default: "The Build Journal has longer articles on business, migration and wealth.",
      },
    ],
  },
  {
    id: "media",
    label: "Media page",
    fields: [
      {
        key: "media.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Everything you need to feature Lami accurately. For interviews and commentary, use the media enquiry route below.",
      },
      {
        key: "media.nametitle",
        label: "Approved name & title text",
        type: "textarea",
        default: "Temitope Olamide Oni Mole, known publicly as Lami the Migrant CEO, entrepreneur, educator and speaker.",
      },
      {
        key: "media.shortbio",
        label: "Short biography",
        type: "textarea",
        default: "Lami the Migrant CEO is an entrepreneur, educator and speaker helping African women migrants build businesses and generational wealth. She rebuilt her business journey in the UK from less than £200 into a wholesale operation, education programmes and a growing community.",
      },
      {
        key: "media.longbio",
        label: "Long biography",
        type: "textarea",
        default: "Temitope Olamide Oni Mole, known publicly as Lami the Migrant CEO, is an entrepreneur, educator, speaker and community builder. After more than a decade building businesses in Nigeria, she moved to the United Kingdom in 2022 and rebuilt from the ground up, starting with less than £200. She has since built product businesses, a physical wholesale operation in Liverpool, business education programmes and communities, directly supporting over 500 people with total impact approaching 1,000. She is the founder of African Women Builds and GBG Wholesale Hub, and the founder and host of Build Her Empire Live.",
      },
      {
        key: "media.assets.withheadshot",
        label: "Headshots & logos text (headshot uploaded)",
        type: "textarea",
        default: "The approved headshot is above. Logos and additional assets are being finalised. Request them directly.",
      },
      {
        key: "media.assets.noheadshot",
        label: "Headshots & logos text (no headshot yet)",
        type: "textarea",
        default: "Approved headshots and logos are being finalised. For now, request them directly.",
      },
      {
        key: "media.speakingtopics",
        label: "Speaking topics card text",
        type: "textarea",
        default: "Migration and rebuilding, product business in the UK, community and collective buying, income to asset ownership.",
      },
      {
        key: "media.appearances",
        label: "Previous appearances card text",
        type: "textarea",
        default: "Enry Live and Direct, Birmingham (OREP Limited). Build Her Empire Live, Liverpool, 15 August 2026.",
      },
    ],
  },
  {
    id: "contact",
    label: "Contact page",
    fields: [
      {
        key: "contact.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Choose the right route below and I'll make sure your message reaches the right place. I aim to reply within one working day.",
      },
      {
        key: "contact.footnote",
        label: "\"Or reach me directly\" footnote",
        type: "textarea",
        default: "For press and speaking, use the form and pick the matching enquiry type so it routes correctly.",
      },
    ],
  },
  {
    id: "events",
    label: "Events listing page",
    fields: [
      {
        key: "events.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "In-person experiences where African women build businesses, wealth and community together.",
      },
    ],
  },
  {
    id: "journal",
    label: "Journal listing page",
    fields: [
      { key: "journal.heading", label: "Heading", type: "text", default: "Business lessons, migration and wealth." },
      {
        key: "journal.subtext",
        label: "Subtext",
        type: "textarea",
        default: "Long-form insight and behind-the-scenes thinking on building businesses, wealth and legacy.",
      },
    ],
  },
  {
    id: "wholesale",
    label: "Wholesale Hub page",
    fields: [
      {
        key: "wholesale.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Wholesale bundles of jewelry and accessories, vetted to sell. Every bundle shows the typical resale value up front, so you know your margin before you buy. Restocked monthly.",
      },
    ],
  },
  {
    id: "products",
    label: "Products listing page",
    fields: [
      {
        key: "products.subtext",
        label: "Hero subtext",
        type: "textarea",
        default: "Every product is built for the same person: someone starting a real product business in the UK on a small budget.",
      },
      { key: "products.feature.0.h", label: "Feature 1 — heading", type: "text", default: "Built from real experience" },
      { key: "products.feature.0.b", label: "Feature 1 — body", type: "textarea", default: "Every module comes from what actually worked, not theory." },
      { key: "products.feature.1.h", label: "Feature 2 — heading", type: "text", default: "You work to your budget" },
      { key: "products.feature.1.b", label: "Feature 2 — body", type: "textarea", default: "Start from around £200. Nothing here assumes deep pockets." },
      { key: "products.feature.2.h", label: "Feature 3 — heading", type: "text", default: "A community, not a course" },
      { key: "products.feature.2.b", label: "Feature 3 — body", type: "textarea", default: "Every product plugs you into other women building the same thing." },
      { key: "products.faq.heading", label: "FAQ heading", type: "text", default: "Questions before you join." },
      { key: "products.faq.0.q", label: "FAQ 1 — question", type: "text", default: "What if I have never sold anything?" },
      { key: "products.faq.0.a", label: "FAQ 1 — answer", type: "textarea", default: "That is exactly who this is built for. We start from your first order." },
      { key: "products.faq.1.q", label: "FAQ 2 — question", type: "text", default: "How much stock money do I need?" },
      { key: "products.faq.1.a", label: "FAQ 2 — answer", type: "textarea", default: "You can start from around £200. We work to your budget, not a fixed one." },
      { key: "products.faq.2.q", label: "FAQ 3 — question", type: "text", default: "Do I get access straight away?" },
      { key: "products.faq.2.a", label: "FAQ 3 — answer", type: "textarea", default: "Yes. Payment gives instant access by email to your student area." },
    ],
  },
  {
    id: "my",
    label: "My products page (signed-in)",
    fields: [
      { key: "my.empty.heading", label: "Empty state heading", type: "text", default: "Nothing here yet." },
      {
        key: "my.empty.subtext",
        label: "Empty state subtext",
        type: "textarea",
        default: "When you join a product it shows up here with all your materials.",
      },
    ],
  },
  {
    id: "start",
    label: "Link-in-bio page (/start)",
    fields: [
      { key: "start.tagline", label: "Tagline under name", type: "textarea", default: "Build the Business. Build the Wealth. Build the Legacy." },
      { key: "start.newsletter.heading", label: "Newsletter heading", type: "text", default: "Subscribe to updates." },
      {
        key: "start.newsletter.subtext",
        label: "Newsletter subtext",
        type: "textarea",
        default: "New drops, free tools and business insight, straight to your inbox.",
      },
    ],
  },
  {
    id: "thankyou",
    label: "Thank-you page (after payment)",
    fields: [
      { key: "thankyou.product.body", label: "Product purchase — message", type: "textarea", default: "Your place is confirmed. Check your email for your receipt and joining details. If you do not see it in a few minutes, look in your spam folder or message Lami on WhatsApp." },
      { key: "thankyou.wholesale.body", label: "Wholesale order — message", type: "textarea", default: "Your payment went through and your bundle is being packed. Check your email for your receipt; tracking details follow once it ships." },
      { key: "thankyou.event.body", label: "Event ticket — message", type: "textarea", default: "Your payment went through and your place is booked. Check your email for your ticket and joining details. If you do not see it in a few minutes, look in your spam folder or message Lami on WhatsApp." },
    ],
  },
  {
    id: "checkout-cancelled",
    label: "Checkout cancelled page",
    fields: [
      { key: "checkoutcancelled.heading", label: "Heading", type: "text", default: "Nothing was charged." },
      {
        key: "checkoutcancelled.body",
        label: "Body",
        type: "textarea",
        default: "You closed the checkout before paying, so your card was not touched. Whenever you are ready, your place is still here.",
      },
    ],
  },
  {
    id: "login",
    label: "Sign-in page",
    fields: [
      {
        key: "login.subtext",
        label: "Subtext",
        type: "textarea",
        default: "No passwords here. Enter your email and we send you a one-tap link.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy policy page",
    fields: [
      { key: "privacy.notice", label: "Review notice", type: "text", default: "Placeholder. To be reviewed by a solicitor before launch." },
      { key: "privacy.collect", label: "\"What we collect\"", type: "textarea", default: "When you contact us or buy a product we collect your name, email, and any details you choose to share. Payments are handled by Stripe; we do not store your card details." },
      { key: "privacy.use", label: "\"How we use it\"", type: "textarea", default: "To reply to you, deliver what you bought, and, only if you opt in, send occasional emails about new products. You can unsubscribe at any time." },
      { key: "privacy.analytics", label: "\"Analytics\"", type: "textarea", default: "We measure page visits without cookies and without storing your IP address, so there is no tracking that would require a consent banner." },
      { key: "privacy.rights", label: "\"Your rights\"", type: "textarea", default: "You can ask us to show, correct, or delete the data we hold about you. Email the address on our contact page." },
    ],
  },
  {
    id: "cookies",
    label: "Cookie policy page",
    fields: [
      { key: "cookies.notice", label: "Review notice", type: "text", default: "Last updated on launch. Placeholder pending final review." },
      { key: "cookies.shortversion", label: "\"The short version\"", type: "textarea", default: "This website does not use advertising or cross-site tracking cookies. We use privacy-friendly, cookieless analytics that never store your IP address, so there is nothing that would require an intrusive consent gate." },
      { key: "cookies.storage", label: "\"Essential storage\"", type: "textarea", default: "We use small amounts of local storage in your browser to remember things like your cookie acknowledgement and the contents of your wholesale order. This information stays on your device." },
      { key: "cookies.thirdparties", label: "\"Third parties\"", type: "textarea", default: "Payments are processed by Stripe and email by our newsletter provider; each has its own privacy and cookie policies. Embedded videos may set cookies from their host (for example YouTube) only when you play them." },
      { key: "cookies.choice", label: "\"Your choice\"", type: "textarea", default: "You can clear site storage at any time from your browser settings." },
    ],
  },
  {
    id: "terms",
    label: "Terms page",
    fields: [
      { key: "terms.notice", label: "Review notice", type: "text", default: "Placeholder. To be reviewed by a solicitor before launch." },
      { key: "terms.access", label: "\"Products and access\"", type: "textarea", default: "When you buy a product you get access to its materials as described on its page. Live cohort dates are shown before you pay." },
      { key: "terms.refund", label: "\"Refund policy\"", type: "textarea", default: "Because products give instant digital access, they are non-refundable once accessed, except where required by UK consumer law. If something is wrong, contact us and we will make it right. This policy is also shown at checkout." },
      { key: "terms.wholesale", label: "\"Wholesale orders\"", type: "textarea", default: "Physical bundles are covered by our shipping and returns terms, shown on each product page." },
    ],
  },
  {
    id: "chrome",
    label: "Site-wide (footer & header)",
    fields: [
      {
        key: "chrome.footer.mission",
        label: "Footer mission blurb",
        type: "textarea",
        default: "Build the Business. Build the Wealth. Build the Legacy. Helping African women migrants build businesses and generational wealth.",
      },
      {
        key: "chrome.footer.buildletter",
        label: "Footer \"Build Letter\" blurb",
        type: "textarea",
        default: "Practical business, wealth and legacy insights. No fluff.",
      },
      {
        key: "chrome.footer.companynote",
        label: "Footer company-details note",
        type: "textarea",
        default: "Lami the Migrant CEO is the home of African Women Builds and the GBG Wholesale Hub. Company details to be confirmed before launch.",
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
