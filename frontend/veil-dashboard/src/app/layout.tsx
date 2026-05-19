import type { Metadata } from 'next'
import './globals.css'
import BackgroundGlobe from '@/components/BackgroundGlobe'

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
      <body className="relative">
        <BackgroundGlobe />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
