import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { LoginForm } from "@/components/LoginForm";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your student area.",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const siteContent = await getSiteContent();
  const c = (key: string) => content(siteContent, key);
  return (
    <Section background="shell">
      <div className="mx-auto max-w-md">
        <h1>Sign in.</h1>
        <p className="mt-4 text-muted">{c("login.subtext")}</p>
        <div className="mt-8">
          <LoginForm next={searchParams.next} />
        </div>
      </div>
    </Section>
  );
}
