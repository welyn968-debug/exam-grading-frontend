'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { SectionHeader } from '@/components/section-header'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listExams, type Exam } from '@/lib/api'

const fallbackExams: Exam[] = [
  {
    id: 'dept-1',
    title: 'Calculus I Midterm',
    courseCode: 'MAT101',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'completed',
    submissionCount: 45,
    gradedCount: 45,
    averageGrade: 76.5,
    lecturer: 'Dr. Daniel Kipkemei',
  },
  {
    id: 'dept-2',
    title: 'Physics II Final',
    courseCode: 'PHY202',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'in-progress',
    submissionCount: 52,
    gradedCount: 31,
    averageGrade: 78.3,
    lecturer: 'Dr. Jane Kipkoskei',
  },
]

function toStatusBadge(status: string) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
  return 'bg-amber-100 text-amber-700'
}

export default function AllExamsPage() {
  const [exams, setExams] = useState<Exam[]>(fallbackExams)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')

  useEffect(() => {
    async function run() {
      try {
        setIsLoading(true)
        const response = await listExams()
        setExams(response.length > 0 ? response : fallbackExams)
        setError(null)
      } catch (err) {
        setExams(fallbackExams)
        setError(err instanceof Error ? err.message : 'Failed to load all exams.')
      } finally {
        setIsLoading(false)
      }
    }
    void run()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return exams
    return exams.filter((exam) => String(exam.status) === filter)
  }, [exams, filter])

  return (
    <LayoutWrapper role="department_head">
      <div className="space-y-6">
        <SectionHeader
          title="All Exams"
          description={`Total: ${exams.length} exams across the department`}
        />

        {error && (
          <div className="dashboard-panel border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}. Showing fallback dataset.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'in-progress', 'completed'].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                filter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-white text-foreground hover:bg-muted'
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <DataTable
          columns={[
            {
              key: 'title',
              label: 'Exam',
              render: (value: string, row: Exam) => (
                <div>
                  <p className="font-medium text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{row.courseCode}</p>
                </div>
              ),
            },
            {
              key: 'lecturer',
              label: 'Lecturer',
              render: (value: string) => <span>{value ?? 'N/A'}</span>,
            },
            { key: 'semester', label: 'Semester' },
            {
              key: 'submissionCount',
              label: 'Progress',
              render: (value: number, row: Exam) => (
                <span>
                  {row.gradedCount ?? 0}/{value ?? 0}
                </span>
              ),
            },
            {
              key: 'gradedCount',
              label: 'Auto-Approved %',
              render: (_: number, row: Exam) => {
                const total = row.submissionCount ?? 0
                const graded = row.gradedCount ?? 0
                const pct = total > 0 ? Math.round((graded / total) * 100) : 0
                return <span>{pct}%</span>
              },
            },
            {
              key: 'averageGrade',
              label: 'Avg Grade',
              render: (value: number) => <span>{value ? `${value.toFixed(1)}%` : '-'}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => (
                <Badge className={`${toStatusBadge(value)} border-0`}>{value}</Badge>
              ),
            },
          ]}
          data={isLoading ? [] : filtered}
          rowKey="id"
          actions={(row) => (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg text-xs">
                <Eye className="size-3.5" />
                View
              </Button>
              <Button size="sm" className="rounded-lg bg-primary text-white hover:bg-primary/90">
                Report
              </Button>
            </div>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="dashboard-panel p-4 text-center">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-semibold text-foreground">
              {exams.filter((exam) => String(exam.status) === 'pending').length}
            </p>
          </div>
          <div className="dashboard-panel p-4 text-center">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-semibold text-foreground">
              {exams.filter((exam) => String(exam.status) === 'in-progress').length}
            </p>
          </div>
          <div className="dashboard-panel p-4 text-center">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-semibold text-foreground">
              {exams.filter((exam) => String(exam.status) === 'completed').length}
            </p>
          </div>
          <div className="dashboard-panel p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-2xl font-semibold text-foreground">
              {exams.reduce((sum, exam) => sum + (exam.submissionCount ?? 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
