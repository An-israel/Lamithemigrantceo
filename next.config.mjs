/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : "mnhpprzuheyowtiuibat.supabase.co";
  } catch {
    return "mnhpprzuheyowtiuibat.supabase.co";
  }
})();

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/programs", destination: "/products", permanent: true },
      { source: "/programs/:slug", destination: "/products/:slug", permanent: true },
      { source: "/admin/programs", destination: "/admin/products", permanent: true },
      { source: "/admin/programs/:id", destination: "/admin/products/:id", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' data: https://${supabaseHost} https://images.unsplash.com`,
              "font-src 'self' data:",
              `connect-src 'self' https://${supabaseHost}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  images: {
    // AVIF disabled: GHSA-2xp9-vwfh-vxw4 is a critical unauthenticated RCE in
    // Next's Image Optimization API when AVIF output is enabled, fixed only
    // in next@>=15.5.24 (we're on 14.2.35, the latest 14.x release — no
    // patched 14.x exists). This avoids the vulnerable code path entirely
    // until the app is upgraded to a patched major version; re-enable once
    // that upgrade lands. webp still gets the same compression benefit.
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
      // Placeholder imagery used before real assets are uploaded.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
