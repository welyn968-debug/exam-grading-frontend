import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
      <main className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 text-center">
        <div className="space-y-4">
          <p className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            AI Exam Grading for Kenyan Universities
          </p>
          <h1 className="text-4xl font-bold leading-tight text-blue-700 sm:text-5xl">
            ExamGrader KE
          </h1>
          <p className="text-lg text-gray-600 sm:text-xl">
            AI-powered grading with lecturer-in-the-loop control, real-time progress, and fairness monitoring.
          </p>
        </div>

        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <a
            href="/auth/login"
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-2xl font-bold text-blue-700">Sign In →</h3>
            <p className="mt-3 text-gray-600">
              Access your dashboard to manage exams and grades.
            </p>
          </a>

          <a
            href="/auth/signup"
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-2xl font-bold text-blue-700">Sign Up →</h3>
            <p className="mt-3 text-gray-600">
              Create an account to start grading exams with AI.
            </p>
          </a>
        </div>
      </main>

      <footer className="mt-10 flex w-full items-center justify-center border-t py-6">
        <p className="text-sm text-gray-500">
          (c) {new Date().getFullYear()} ExamGrader KE. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
