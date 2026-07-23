import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your student area.",
  robots: { index: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <Section background="shell">
      <div className="mx-auto max-w-md">
        <h1>Sign in.</h1>
        <p className="mt-4 text-muted">
          No passwords here. Enter your email and we send you a one-tap link.
        </p>
        <div className="mt-8">
          <LoginForm next={searchParams.next} />
        </div>
      </div>
    </Section>
  );
}
