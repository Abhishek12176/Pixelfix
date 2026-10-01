import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'onnxruntime-web'];
    } else {
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-web': path.resolve(process.cwd(), 'node_modules/onnxruntime-web/dist/ort.all.min.js'),
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/editor/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
      {
        source: "/editor",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
