import '../styles.css'

export const metadata = {
  title: 'Hometongue 家乡话',
  description: 'One small, low-pressure conversation a day in Hokkien, Teochew or Cantonese.',
  applicationName: 'Hometongue',
  appleWebApp: { capable: true, title: 'Hometongue', statusBarStyle: 'default' },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  themeColor: '#f4ecdd',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Pixelify+Sans:wght@400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
