/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  serverExternalPackages: ['@genkit-ai/googleai', '@genkit-ai/core', 'genkit'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https', 
        hostname: 'storage.googleapis.com',
      }
    ]
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Webpack configuration for client-side compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'http2': false,
      }
    }
    
    // External modules that should not be bundled
    config.externals = config.externals || []
    config.externals.push({
      '@genkit-ai/googleai': 'commonjs @genkit-ai/googleai',
      '@genkit-ai/core': 'commonjs @genkit-ai/core',
      'genkit': 'commonjs genkit'
    })
    
    return config
  },
  experimental: {
    esmExternals: true
  }
}

module.exports = nextConfig
