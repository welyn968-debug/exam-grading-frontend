'use client'

import { useEffect, useMemo, useState } from 'react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { listExams, type Exam } from '@/lib/api'
import { Bell } from 'lucide-react'

type PageProps = {
  params: { id: string }
}

const fallbackLecturer = {
  id: 'lecturer-fallback',
  name: 'Dr. Jane Kipkoskei',
  email: 'kipkoskei@university.ke',
  departmentAverage: 78.3,
}

export default function LecturerDetailPage({ params }: PageProps) {
  const [lecturer] = useState(fallbackLecturer)
  const [exams, setExams] = useState<Exam[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      try {
        const response = await listExams()
        setExams(response)
      } catch (err) {
        setExams([])
        setMessage(err instanceof Error ? err.message : 'Showing empty dataset.')
      }
    }
    void run()
  }, [])

  const lecturerExams = useMemo(
    () => exams.filter((exam) => exam.lecturer === lecturer.name || exam.id.includes(params.id)),
    [exams, lecturer.name, params.id],
  )

  const metrics = useMemo(() => {
    const totalStudents = lecturerExams.reduce((sum, exam) => sum + (exam.submissionCount ?? 0), 0)
    const completed = lecturerExams.filter((exam) => String(exam.status) === 'completed').length
    const average =
      lecturerExams.length > 0
        ? lecturerExams.reduce((sum, exam) => sum + (exam.averageGrade ?? 0), 0) /
          lecturerExams.length
        : 0
    return { totalStudents, completed, average }
  }, [lecturerExams])

  return (
    <LayoutWrapper role="department_head">
      <div className="space-y-6">
        <div className="dashboard-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Lecturer</p>
              <h1 className="text-2xl font-semibold text-foreground">{lecturer.name}</h1>
              <p className="text-xs text-muted-foreground">{lecturer.email}</p>
            </div>
            <Button variant="outline" className="rounded-xl flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Request Update
            </Button>
          </div>
        </div>

        {message && (
          <div className="dashboard-panel border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Active Exams" value={lecturerExams.length} color="primary" />
          <StatCard label="Completed Exams" value={metrics.completed} color="secondary" />
          <StatCard label="Total Students" value={metrics.totalStudents} color="accent" />
          <StatCard
            label="Average Grade"
            value={`${metrics.average.toFixed(1)}%`}
            color="primary"
          />
        </div>

        <div className="dashboard-panel p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Exams by {lecturer.name}</h2>
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
                key: 'averageGrade',
                label: 'Avg Grade',
                render: (value: number) => <span>{value ? `${value.toFixed(1)}%` : '-'}</span>,
              },
              {
                key: 'status',
                label: 'Status',
                render: (value: string) => (
                  <Badge className="border-0 bg-primary/10 text-primary">{value}</Badge>
                ),
              },
            ]}
            data={lecturerExams}
            rowKey="id"
          />
        </div>

        <div className="dashboard-panel grid gap-4 p-5 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Comparison
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Department average: {lecturer.departmentAverage.toFixed(1)}%
            </p>
            <p className="text-sm text-foreground">
              {lecturer.name} average: {metrics.average.toFixed(1)}%
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Notes
            </h3>
            <p className="text-sm text-muted-foreground">
              Use this page to keep tabs on lecturer progress and prompt timely updates when grading
              slows down.
            </p>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
