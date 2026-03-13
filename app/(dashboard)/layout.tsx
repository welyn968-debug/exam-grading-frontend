import { AuthProvider } from '@/hooks/useAuth'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthProvider>{children}</AuthProvider>
}
