import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next-auth v5 beta's export map isn't resolved correctly by Next.js webpack.
  // transpilePackages forces Next.js to compile the package directly, fixing
  // both the server and client bundle resolution for next-auth/react.
  transpilePackages: ['next-auth'],
};

export default nextConfig;
