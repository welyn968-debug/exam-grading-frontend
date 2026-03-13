'use client'

import Link from 'next/link'
import { Bell, Menu, Plus, Search } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  onMenuToggle: () => void
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-30 border-b border-border/70 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-slate-700 transition-colors hover:bg-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 md:flex">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search exams, students, grades..."
              className="w-72 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            className="hidden rounded-xl bg-primary px-4 text-primary-foreground shadow-[0_12px_28px_-20px_rgba(31,78,216,0.9)] hover:bg-primary/90 sm:inline-flex"
          >
            <Link href="/exams">
              <Plus className="size-4" />
              New Exam
            </Link>
          </Button>

          <button className="relative inline-flex size-10 items-center justify-center rounded-xl border border-border bg-white hover:bg-muted">
            <Bell className="size-5 text-foreground" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
          </button>

          <UserButton
            afterSignOutUrl="/auth/login"
            userProfileMode="navigation"
            userProfileUrl="/profile"
            appearance={{
              elements: {
                rootBox:
                  'rounded-xl border border-border bg-white px-1.5 py-1 shadow-sm hover:bg-muted transition-colors',
                avatarBox: 'size-9',
              },
            }}
          />
        </div>
      </div>
    </nav>
  )
}
