'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { listExams, type Exam } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, FlaskConical, ArrowUpRight } from 'lucide-react'

const fallbackExams: Exam[] = [
  {
    id: 'fallback-phy202',
    title: 'Physics II Final Exam',
    courseCode: 'PHY202',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'ready',
    submissionCount: 52,
    gradedCount: 11,
  },
  {
    id: 'fallback-cs101',
    title: 'CS101 - Intro to Programming',
    courseCode: 'CS101',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'draft',
    submissionCount: 0,
    gradedCount: 0,
  },
  {
    id: 'fallback-math201',
    title: 'MATH201 - Calculus II',
    courseCode: 'MATH201',
    semester: 'Semester 2',
    totalMarks: 100,
    status: 'in-progress',
    submissionCount: 24,
    gradedCount: 12,
  },
]

export default function SetupLandingPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>(fallbackExams)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastExamId, setLastExamId] = useState<string | null>(null)

  useEffect(() => {
    const cached = window.localStorage.getItem('last_exam_for_setup')
    if (cached) setLastExamId(cached)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const response = await listExams()
        setExams(response.length ? response : fallbackExams)
        setError(null)
      } catch (err) {
        setExams(fallbackExams)
        setError(err instanceof Error ? err.message : 'Could not load exams. Showing samples.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filtered = useMemo(() => {
    const term = query.toLowerCase()
    return exams.filter(
      (exam) =>
        exam.title.toLowerCase().includes(term) ||
        exam.courseCode.toLowerCase().includes(term) ||
        exam.semester.toLowerCase().includes(term),
    )
  }, [exams, query])

  function handleSelect(id: string) {
    window.localStorage.setItem('last_exam_for_setup', id)
    router.push(`/exams/${id}/setup`)
  }

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="dashboard-panel flex flex-wrap items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FlaskConical className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Testing & Validation</h1>
              <p className="text-sm text-muted-foreground">
                Pick an exam to run the 5–10 sample-paper validation before full grading.
              </p>
            </div>
          </div>
          {lastExamId && (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push(`/exams/${lastExamId}/setup`)}
            >
              Resume last exam
            </Button>
          )}
        </div>

        <div className="dashboard-panel flex flex-wrap items-center gap-3 p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search exam by title, course code, or semester"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            {loading ? 'Loading exams…' : `${filtered.length} exam(s)`}
            {error && <span className="text-amber-700">• {error}</span>}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="dashboard-panel space-y-3 p-6 text-sm text-muted-foreground">
            <p>No exams found. Create an exam first, then return to run testing.</p>
            <div className="flex gap-2">
              <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={() => router.push('/exams')}>
                Go to Exams
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exam) => (
            <button
              key={exam.id}
              className="dashboard-panel group flex h-full w-full flex-col rounded-2xl border border-border/70 bg-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => handleSelect(exam.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{exam.title}</h3>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {exam.courseCode} • {exam.semester}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="border-border bg-muted/50">
                  {exam.status ?? 'pending'}
                </Badge>
                <Badge variant="outline" className="border-border bg-muted/30">
                  {exam.submissionCount ?? 0} submissions
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    </LayoutWrapper>
  )
}
