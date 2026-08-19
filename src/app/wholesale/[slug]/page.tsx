import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Section } from "@/components/Section";
import { Accordion } from "@/components/Accordion";
import { WholesaleCard } from "@/components/WholesaleCard";
import { AddToOrderButton } from "@/components/cart/AddToOrderButton";
import { RestockAlert } from "@/components/RestockAlert";
import { formatGBP } from "@/lib/format";
import { getBundleBySlug, getBundles } from "@/lib/wholesale";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const b = await getBundleBySlug(params.slug);
  if (!b) return { title: "Bundle not found" };
  return { title: b.name, description: b.description };
}

export async function generateStaticParams() {
  const bundles = await getBundles();
  return bundles.map((b) => ({ slug: b.slug }));
}

export default async function WholesaleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const bundle = await getBundleBySlug(params.slug);
  if (!bundle) notFound();

  const all = await getBundles();
  const related = all.filter((b) => b.id !== bundle.id).slice(0, 3);
  const soldOut = bundle.stock <= 0;
  const cover = bundle.images[0] ?? null;
  const margin =
    bundle.typical_resale_gbp != null
      ? bundle.typical_resale_gbp - bundle.price_gbp
      : null;

  return (
    <>
      <Section background="shell" className="!pb-10">
        <Link
          href="/wholesale"
          className="text-sm text-muted no-underline hover:text-clay"
        >
          ← All bundles
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-card bg-peach-deep">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={bundle.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-5xl text-ink/40">
                  {bundle.name.charAt(0)}
                </span>
              )}
            </div>
            {bundle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {bundle.images.slice(0, 4).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt={`${bundle.name} ${i + 1}`}
                    className="aspect-square w-full rounded-input object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Buy panel */}
          <div>
            <span className="pill bg-peach text-ink">{bundle.category}</span>
            <h1 className="mt-3">{bundle.name}</h1>
            <p className="mt-3 text-muted">{bundle.description}</p>

            <div className="mt-6">
              <span className="price !text-[32px]">
                {formatGBP(bundle.price_gbp)}
              </span>
              {bundle.typical_resale_gbp != null && (
                <p className="mt-1 text-muted">
                  Typical resale {formatGBP(bundle.typical_resale_gbp)}
                  {margin != null && (
                    <span className="font-bold text-jade">
                      {" "}
                      · +{formatGBP(margin)} margin
                    </span>
                  )}
                </p>
              )}
            </div>

            <span className="pill mt-4 bg-peach text-ink">
              {bundle.unit_count} pieces
            </span>

            <div className="mt-6">
              {soldOut ? (
                <div>
                  <span className="pill bg-line text-muted">Sold out</span>
                  <div className="mt-3">
                    <RestockAlert productId={bundle.id} />
                  </div>
                </div>
              ) : (
                <AddToOrderButton
                  product={{
                    id: bundle.id,
                    slug: bundle.slug,
                    name: bundle.name,
                    price_gbp: bundle.price_gbp,
                    image: cover,
                    stock: bundle.stock,
                  }}
                  className="w-full sm:w-auto"
                />
              )}
            </div>

            <div className="mt-8 max-w-prose">
              <h3>What is inside</h3>
              <p className="mt-2 text-muted">{bundle.whats_inside}</p>
            </div>

            <div className="mt-8 max-w-prose">
              <Accordion
                items={[
                  {
                    title: "Shipping and returns",
                    body: "UK shipping is calculated at checkout. Bundles are wholesale stock for resale — see our terms for the returns policy.",
                  },
                  {
                    title: "Sizing and materials",
                    body: "Materials vary by piece. Full details are included on the packing slip with every bundle.",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section background="peach">
          <h2>More bundles.</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {related.map((b) => (
              <WholesaleCard key={b.id} b={b} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
