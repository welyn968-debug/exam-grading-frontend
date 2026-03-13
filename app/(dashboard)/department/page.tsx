'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Users } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { StatCard } from '@/components/stat-card'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { getDepartmentAiHealth, listExams, type DepartmentAiHealth, type Exam } from '@/lib/api'

const fallbackExams: Exam[] = [
  {
    id: 'd-1',
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
    id: 'd-2',
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

const fallbackHealth: DepartmentAiHealth = {
  averageConfidence: 87.2,
  overrideRate: 7.5,
  flaggedExams: 2,
  activeModels: ['deepseek-chat'],
  recentAlerts: ['High override in PHY202 Q5'],
}

function statusBadge(status: string) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
  return 'bg-amber-100 text-amber-700'
}

export default function DepartmentPage() {
  const [exams, setExams] = useState<Exam[]>(fallbackExams)
  const [health, setHealth] = useState<DepartmentAiHealth>(fallbackHealth)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      try {
        const [examsResponse, healthResponse] = await Promise.all([
          listExams(),
          getDepartmentAiHealth(),
        ])
        setExams(examsResponse.length > 0 ? examsResponse : fallbackExams)
        setHealth(healthResponse)
        setMessage(null)
      } catch (err) {
        setExams(fallbackExams)
        setHealth(fallbackHealth)
        setMessage(
          err instanceof Error
            ? `${err.message}. Department fallback view enabled.`
            : 'Department fallback view enabled.',
        )
      }
    }
    void run()
  }, [])

  const metrics = useMemo(() => {
    const students = exams.reduce((sum, exam) => sum + (exam.submissionCount ?? 0), 0)
    const completed = exams.filter((exam) => String(exam.status) === 'completed').length
    const average =
      exams.length > 0
        ? exams.reduce((sum, exam) => sum + (exam.averageGrade ?? 0), 0) / exams.length
        : 0
    const autoApproved = exams.reduce((sum, exam) => {
      if (typeof exam.gradedCount === 'number' && typeof exam.submissionCount === 'number') {
        const approved = Math.min(exam.gradedCount, exam.submissionCount)
        return sum + approved
      }
      return sum
    }, 0)
    const timeSavedHours = (autoApproved * 3.1) / 60
    return { students, completed, average, autoApproved, timeSavedHours }
  }, [exams])

  const lecturerGrid = useMemo(() => {
    const map = new Map<
      string,
      { lecturer: string; exams: number; pending: number; completion: number }
    >()
    exams.forEach((exam) => {
      const name = exam.lecturer ?? 'Unknown Lecturer'
      if (!map.has(name)) {
        map.set(name, { lecturer: name, exams: 0, pending: 0, completion: 0 })
      }
      const entry = map.get(name)!
      entry.exams += 1
      const total = exam.submissionCount ?? 0
      const graded = exam.gradedCount ?? 0
      entry.completion += total > 0 ? Math.round((graded / total) * 100) : 0
      entry.pending += Math.max(total - graded, 0)
    })
    return Array.from(map.values()).map((row) => ({
      ...row,
      completion: row.exams > 0 ? Math.round(row.completion / row.exams) : 0,
    }))
  }, [exams])

  return (
    <LayoutWrapper role="department_head">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Department Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI health and grading operations across all department exams.
          </p>
        </div>

        {message && (
          <div className="dashboard-panel border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Exams"
            value={exams.length}
            icon={<BarChart3 className="size-5" />}
            color="primary"
          />
          <StatCard
            label="Completed Exams"
            value={metrics.completed}
            icon={<BarChart3 className="size-5" />}
            color="secondary"
          />
          <StatCard
            label="Total Students"
            value={metrics.students}
            icon={<Users className="size-5" />}
            color="accent"
          />
          <StatCard
            label="Avg Confidence"
            value={`${health.averageConfidence.toFixed(1)}%`}
            icon={<BarChart3 className="size-5" />}
            color="primary"
          />
          <StatCard
            label="Time Saved"
            value={`${metrics.timeSavedHours.toFixed(1)} hrs`}
            icon={<BarChart3 className="size-5" />}
            color="secondary"
          />
        </div>

        <div className="dashboard-panel p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Lecturer Progress Grid</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lecturerGrid.map((row) => (
              <div
                key={row.lecturer}
                className="rounded-xl border border-border bg-muted/30 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{row.lecturer}</p>
                  <Badge className="border-0 bg-primary/10 text-primary">
                    {row.completion}% done
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Exams: {row.exams} • Pending reviews: {row.pending}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel p-5">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Department Exam Activity</h2>
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
                key: 'status',
                label: 'Status',
                render: (value: string) => (
                  <Badge className={`${statusBadge(value)} border-0`}>{value}</Badge>
                ),
              },
            ]}
            data={exams}
            rowKey="id"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="dashboard-panel p-5">
            <h3 className="mb-3 text-base font-semibold text-foreground">AI Health</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Average confidence: {health.averageConfidence.toFixed(1)}%</li>
              <li>Override rate: {health.overrideRate.toFixed(1)}%</li>
              <li>Flagged exams: {health.flaggedExams}</li>
            </ul>
          </div>
          <div className="dashboard-panel p-5">
            <h3 className="mb-3 text-base font-semibold text-foreground">Recent Alerts</h3>
            {health.recentAlerts && health.recentAlerts.length > 0 ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {health.recentAlerts.map((alert) => (
                  <li key={alert}>{alert}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No active alerts.</p>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
