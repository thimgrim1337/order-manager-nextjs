import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	serverExternalPackages: ["chromium-bidi"],
	cacheComponents: true,
};

export default nextConfig;
