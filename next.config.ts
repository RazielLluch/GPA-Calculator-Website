import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
    allowedDevOrigins: ['192.168.0.104', 'http://192.168.0.104:3000', '192.168.0.104:3000']
}

export default nextConfig;
