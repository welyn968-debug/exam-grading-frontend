'use client'

import { SignUp } from '@clerk/nextjs'
import { AuthShell } from '@/components/auth/AuthShell'

export default function SignupPage() {
  return (
    <AuthShell
      useCard
      cardTitle="Create your account"
      cardDescription="Set up ExamGrader KE and stay in control of AI grading."
    >
      <SignUp
        path="/auth/signup"
        routing="path"
        signInUrl="/auth/login"
        afterSignUpUrl="/dashboard"
        redirectUrl="/dashboard"
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
