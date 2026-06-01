/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@postcard-platform/api",
    "@postcard-platform/db",
    "@postcard-platform/ai",
    "mapbox-gl",
  ],

  async redirects() {
    return [
      {
        source: "/direct-mail-marketing",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/every-door-direct-mail",
        destination: "/products/every-door-direct-mail",
        permanent: true,
      },
      {
        source: "/targeted-direct-mail",
        destination: "/products/targeted-direct-mail",
        permanent: true,
      },
    ];
  },

  // Externalize native/server-only packages from the server bundle.
  // This prevents webpack from trying to parse .node binaries (e.g. @napi-rs/canvas)
  // and complex assets from pdfjs-dist when they are imported via API routes / Inngest functions.
  // They will be required at runtime from node_modules instead.
  serverExternalPackages: [
    "@napi-rs/canvas",
    "pdfjs-dist",
    // Add others here if native modules cause similar parse errors in the future
  ],

  webpack: (config, { isServer }) => {
    // Prevent any accidental client-side inclusion of server-only native modules
    config.resolve.alias = {
      ...config.resolve.alias,
      "@napi-rs/canvas": false,
      canvas: false,
      // pdfjs worker is never needed in browser bundle for this server-only usage
      "pdfjs-dist/build/pdf.worker.js": false,
      "pdfjs-dist/build/pdf.worker.mjs": false,
      "pdfjs-dist/build/pdf.worker.min.js": false,
    };

    if (isServer) {
      // Extra protection for native binaries in monorepo + Vercel builds
      // (the binary parse error with skia.linux-x64-gnu.node comes from incorrect bundling)
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          '@napi-rs/canvas',
          'canvas',
          /^@napi-rs\/canvas-.*$/
        );
      }

      // Native .node files are fully externalized via serverExternalPackages + explicit externals.
      // No additional rule needed to avoid introducing loader or emit issues.
    }

    return config;
  },
};

export default nextConfig;
