/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdfjs-dist optionally requires "canvas" in Node; we only run it in the browser.
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
