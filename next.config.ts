import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ENABLE_PWA_DEV !== "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // empty config to suppress the warning/error
  }
};

export default withSerwist(nextConfig);
