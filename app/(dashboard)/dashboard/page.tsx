'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { BarChart3, ClipboardList, Clock3, GraduationCap, Plus } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { StatCard } from '@/components/stat-card'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listExams, type Exam } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useRealtime } from '@/hooks/useRealtime'

const fallbackExams: Exam[] = [
  {
    id: 'fallback-1',
    title: 'CS101 - Intro to Programming',
    courseCode: 'CS101',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'ready',
    submissionCount: 84,
    gradedCount: 64,
    averageGrade: 74,
  },
  {
    id: 'fallback-2',
    title: 'MATH201 - Calculus II',
    courseCode: 'MATH201',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'in-progress',
    submissionCount: 68,
    gradedCount: 42,
    averageGrade: 69,
  },
  {
    id: 'fallback-3',
    title: 'PHY302 - Waves and Optics',
    courseCode: 'PHY302',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'pending',
    submissionCount: 57,
    gradedCount: 0,
    averageGrade: 0,
  },
]

function toStatusBadge(status: string) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
  if (status === 'ready') return 'bg-indigo-100 text-indigo-700'
  return 'bg-amber-100 text-amber-700'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [exams, setExams] = useState<Exam[]>(fallbackExams)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRealtimeMessage, setLastRealtimeMessage] = useState<string | null>(null)

  async function loadExams() {
    try {
      setIsLoading(true)
      const response = await listExams()
      setExams(response.length > 0 ? response : fallbackExams)
      setError(null)
    } catch (err) {
      setExams(fallbackExams)
      setError(err instanceof Error ? err.message : 'Failed to load exams')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadExams()
  }, [])

  useRealtime(
    {
      grading_progress: () => {
        setLastRealtimeMessage('Grading progress updated in real time.')
        void loadExams()
      },
      review_ready: () => {
        setLastRealtimeMessage('A review batch is now ready.')
        void loadExams()
      },
      notification: (payload) => {
        if (payload && typeof payload === 'object' && 'message' in payload) {
          const message = (payload as { message?: unknown }).message
          if (typeof message === 'string') {
            setLastRealtimeMessage(message)
          }
        }
      },
    },
    { enabled: true },
  )

  const stats = useMemo(() => {
    const activeExams = exams.filter((exam) =>
      ['ready', 'in-progress', 'pending', 'draft'].includes(String(exam.status)),
    ).length
    const pendingReviews = exams.reduce((sum, exam) => {
      const submissions = exam.submissionCount ?? 0
      const graded = exam.gradedCount ?? 0
      return sum + Math.max(submissions - graded, 0)
    }, 0)
    const studentsGraded = exams.reduce(
      (sum, exam) => sum + (exam.gradedCount ?? 0),
      0,
    )
    const estimatedTimeSaved = (studentsGraded * 3.1) / 60

    return {
      activeExams,
      pendingReviews,
      studentsGraded,
      estimatedTimeSaved: estimatedTimeSaved.toFixed(1),
    }
  }, [exams])

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div className="dashboard-panel flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-muted-foreground">Dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Good morning, {user?.name ?? 'Dr. Mwangi'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track grading progress, pending reviews, and exam operations in one place.
            </p>
          </div>
          <Button asChild className="rounded-xl bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <Link href="/exams">
              <Plus className="size-4" />
              New Exam
            </Link>
          </Button>
        </div>

        {lastRealtimeMessage && (
          <div className="dashboard-panel border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {lastRealtimeMessage}
          </div>
        )}

        {error && (
          <div className="dashboard-panel border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}. Showing fallback data.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Exams"
            value={stats.activeExams}
            icon={<ClipboardList className="size-5" />}
            color="primary"
          />
          <StatCard
            label="Pending Reviews"
            value={stats.pendingReviews}
            icon={<BarChart3 className="size-5" />}
            color="secondary"
          />
          <StatCard
            label="Students Graded"
            value={stats.studentsGraded}
            icon={<GraduationCap className="size-5" />}
            color="accent"
          />
          <StatCard
            label="Estimated Time Saved"
            value={`${stats.estimatedTimeSaved} hrs`}
            icon={<Clock3 className="size-5" />}
            color="primary"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Recent Exams
            </h2>
            <Link href="/exams" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          <DataTable
            columns={[
              {
                key: 'title',
                label: 'Course',
                render: (value: string, row: Exam) => (
                  <div>
                    <p className="font-medium text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{row.courseCode}</p>
                  </div>
                ),
              },
              { key: 'semester', label: 'Semester' },
              {
                key: 'status',
                label: 'Status',
                render: (value: string) => (
                  <Badge className={`${toStatusBadge(value)} border-0`}>
                    {value}
                  </Badge>
                ),
              },
              {
                key: 'submissionCount',
                label: 'Submissions',
                render: (value: number, row: Exam) => (
                  <span>
                    {row.gradedCount ?? 0}/{value ?? 0}
                  </span>
                ),
              },
            ]}
            data={isLoading ? [] : exams}
            rowKey="id"
            actions={(row) => (
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <Link href={`/exams/${row.id}`}>Open</Link>
              </Button>
            )}
          />
        </div>
      </div>
    </LayoutWrapper>
  )
}
