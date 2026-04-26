/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Pino is pulled in transitively by @walletconnect → @reown/appkit, and
  // it does an *optional* dynamic require of `pino-pretty` for human-
  // readable dev logs. We never ship pino-pretty in production, so the
  // module-not-found warning is noise — silence it via webpack alias.
  // See: https://github.com/pinojs/pino/issues/1722
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
    };
    return config;
  },
};

module.exports = nextConfig;