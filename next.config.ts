import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Disable type checking during build
  },
};



export default withPayload(withPayload(nextConfig));
