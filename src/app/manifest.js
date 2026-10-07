// Lets phones "Add to Home Screen" and open Hometongue like an app.
export default function manifest() {
  return {
    name: 'Hometongue 家乡话',
    short_name: 'Hometongue',
    description: 'One small, low-pressure conversation a day in Hokkien, Teochew or Cantonese.',
    start_url: '/today',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4ecdd',
    theme_color: '#f4ecdd',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
