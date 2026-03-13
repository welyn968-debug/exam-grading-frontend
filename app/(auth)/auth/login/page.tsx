'use client'

import { SignIn } from '@clerk/nextjs'
import { AuthShell } from '@/components/auth/AuthShell'

export default function LoginPage() {
  return (
    <AuthShell
      useCard
      cardTitle="Welcome back, Lecturer"
      cardDescription="Sign in to your ExamGrader dashboard."
    >
      <SignIn
        path="/auth/login"
        routing="path"
        signUpUrl="/auth/signup"
        redirectUrl="/dashboard"
        afterSignInUrl="/dashboard"
        appearance={{
          elements: {
            card: 'shadow-none border border-slate-200',
            headerTitle: 'text-2xl font-semibold text-slate-900',
          },
        }}
      />
    </AuthShell>
  )
}
