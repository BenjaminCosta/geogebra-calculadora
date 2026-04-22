import type { Metadata, Viewport } from 'next'
import { Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'GeoGebra Calculadora Científica',
  description: 'Calculadora científica con motor GeoGebra',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Calc Científica',
  },
  icons: {
    icon: '/icons/original_icon.webp',
    shortcut: '/icons/original_icon.webp',
    apple: '/icons/original_icon.webp',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6C63FF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-app-bg" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
