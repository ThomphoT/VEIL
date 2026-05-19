import type { Metadata } from 'next'
import './globals.css'
import BackgroundGlobe from '@/components/BackgroundGlobe'
import LoadingScreen from '@/components/LoadingScreen'

export const metadata: Metadata = {
  title: 'VEIL | Trust, before settlement.',
  description: 'AI-native financial governance infrastructure. Autonomous trust layer for global finance.',
  openGraph: {
    title: 'VEIL | Trust, before settlement.',
    description: 'AI-native financial governance infrastructure. Autonomous trust layer for global finance.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative bg-black">
        {/* Subtle grid texture */}
        <div className="grid-bg" aria-hidden="true" />
        {/* Noise film grain */}
        <div className="noise-overlay" aria-hidden="true" />
        {/* Loading screen - client component */}
        <LoadingScreen />
        {/* Background globe */}
        <BackgroundGlobe />
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
