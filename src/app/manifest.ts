import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Coup Online',
    short_name: 'Coup',
    start_url: '/',
    display: 'standalone',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    icons: [
      {
        src: '/coup-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
