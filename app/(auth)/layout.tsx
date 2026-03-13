import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ExamGrader KE - Authentication',
  description: 'Sign in to ExamGrader KE',
}

export default function AuthRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
