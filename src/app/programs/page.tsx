import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ProgramCard } from "@/components/ProgramCard";
import { ProgramFilter } from "@/components/ProgramFilter";
import { getPrograms } from "@/lib/data";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Three ways to work with Lami: live cohorts, self-paced, and 1:1 mentorship.",
};

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <Section background="shell">
      <h1>Programs.</h1>
      <p className="mt-4 max-w-prose text-muted">
        Every program is built for the same person: someone starting a real
        product business in the UK on a small budget.
      </p>
      <div className="mt-10">
        <ProgramFilter programs={programs} />
      </div>
    </Section>
  );
}
