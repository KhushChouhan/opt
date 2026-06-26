/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Suppress Chrome DevTools JSON probe and missing source-map 404s in the terminal
  async headers() {
    return [
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },

  async rewrites() {
    return [
      // Serve an empty JSON so Chrome DevTools stops 404-ing
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/api/devtools-stub',
      },
    ];
  },
};

export default nextConfig;
