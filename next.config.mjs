import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a production build run beside `next dev` without both writing to .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  images: { formats: ["image/avif", "image/webp"] },
  serverExternalPackages: ["mongoose"],
  async headers() {
    // /_next/static is already immutable. These folders keep stable file names, so cache for a day, not forever.
    const day = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/brand/:path*", headers: day },
      { source: "/uploads/:path*", headers: day },
      { source: "/icons.svg", headers: day },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
