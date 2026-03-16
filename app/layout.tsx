import type { Metadata, Viewport } from 'next'
import { ClerkTokenProvider } from '@/components/ClerkTokenProvider'
import { Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'ExamGrader KE - AI Exam Grading System',
  description: 'Intelligent exam grading system for Kenyan universities',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#008751',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <ClerkTokenProvider>
      <html lang="en">
        <body className={`${spaceGrotesk.className} antialiased bg-background text-foreground`}>
          {children}
          <Analytics />
        </body>
      </html>
      </ClerkTokenProvider>
    </ClerkProvider>
  )
}
