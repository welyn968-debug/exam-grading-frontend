'use client'

import type { ReactNode } from 'react'

type AuthShellProps = {
  children: ReactNode
  useCard?: boolean
  cardTitle?: string
  cardDescription?: string
}

export function AuthShell({
  children,
  useCard = true,
  cardTitle,
  cardDescription,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_20%,#c8ead8_0%,#edf6f2_40%,#e2ecff_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(42,104,175,0.18),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(0,135,81,0.18),transparent_32%)] blur-3xl" />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        {useCard ? (
          <div className="relative w-full max-w-md rounded-2xl border border-[#cfe5d9] bg-white/90 p-8 shadow-[0_24px_80px_-44px_rgba(0,135,81,0.7)] backdrop-blur-sm">
            {(cardTitle || cardDescription) && (
              <div className="mb-6 space-y-1">
                {cardTitle && (
                  <h1 className="text-2xl font-semibold text-emerald-900">{cardTitle}</h1>
                )}
                {cardDescription && (
                  <p className="text-sm text-slate-600">{cardDescription}</p>
                )}
              </div>
            )}
            {children}
            <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
              <span>Secure • KDPA compliant</span>
              <span className="text-emerald-700 font-semibold">ExamGrader KE</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">{children}</div>
        )}
      </div>
    </div>
  )
}
