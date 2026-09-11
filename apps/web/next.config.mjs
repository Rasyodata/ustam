import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ustam/shared"],
  images: { remotePatterns: [{ protocol: "http", hostname: "**" }, { protocol: "https", hostname: "**" }] },
};

export default withNextIntl(nextConfig);
