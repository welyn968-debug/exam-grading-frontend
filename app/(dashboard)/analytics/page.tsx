'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import {
  exportExamReport,
  getExamAnalytics,
  listExams,
  type Exam,
  type ExamAnalytics,
} from '@/lib/api'

const fallbackExams: Exam[] = [
  {
    id: 'fallback-analytics-exam',
    title: 'Calculus I Midterm',
    courseCode: 'MAT101',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'completed',
    submissionCount: 45,
    gradedCount: 45,
  },
]

const fallbackAnalytics: ExamAnalytics = {
  examId: 'fallback-analytics-exam',
  averageScore: 77.2,
  passRate: 86.7,
  excellenceRate: 31.2,
  atRiskRate: 13.3,
  gradeDistribution: [
    { label: 'A (90-100)', count: 18 },
    { label: 'B (80-89)', count: 16 },
    { label: 'C (70-79)', count: 21 },
    { label: 'D (60-69)', count: 8 },
    { label: 'F (<60)', count: 5 },
  ],
  questionPerformance: [
    { question: 'Q1', score: 92 },
    { question: 'Q2', score: 88 },
    { question: 'Q3', score: 75 },
    { question: 'Q4', score: 72 },
    { question: 'Q5', score: 58 },
    { question: 'Q6', score: 52 },
  ],
  trend: [
    { label: 'Jan', average: 72 },
    { label: 'Feb', average: 75 },
    { label: 'Mar', average: 78 },
    { label: 'Apr', average: 76 },
    { label: 'May', average: 79 },
    { label: 'Jun', average: 81 },
  ],
}

const chartColors = ['#1f4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']

export default function AnalyticsPage() {
  const [exams, setExams] = useState<Exam[]>(fallbackExams)
  const [selectedExamId, setSelectedExamId] = useState<string>(fallbackExams[0].id)
  const [analytics, setAnalytics] = useState<ExamAnalytics>(fallbackAnalytics)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  async function loadExams() {
    try {
      const response = await listExams()
      const mapped = response.length > 0 ? response : fallbackExams
      setExams(mapped)
      if (!selectedExamId && mapped.length > 0) {
        setSelectedExamId(mapped[0].id)
      }
    } catch {
      setExams(fallbackExams)
    }
  }

  async function loadAnalytics(examId: string) {
    try {
      setIsLoading(true)
      const response = await getExamAnalytics(examId)
      const hasData =
        response.gradeDistribution.length > 0 ||
        response.questionPerformance.length > 0 ||
        response.trend.length > 0
      setAnalytics(hasData ? response : { ...fallbackAnalytics, examId })
      setMessage(null)
    } catch (err) {
      setAnalytics({ ...fallbackAnalytics, examId })
      setMessage(
        err instanceof Error
          ? `${err.message}. Showing fallback analytics.`
          : 'Showing fallback analytics.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadExams()
  }, [])

  useEffect(() => {
    if (!selectedExamId) return
    void loadAnalytics(selectedExamId)
  }, [selectedExamId])

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.id === selectedExamId) ?? exams[0],
    [exams, selectedExamId],
  )

  async function handleExport(format: 'csv' | 'pdf') {
    if (!selectedExamId) return
    try {
      const blob = await exportExamReport(selectedExamId, format)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${selectedExam?.courseCode ?? 'exam'}-analytics.${format}`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export failed.')
    }
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <SectionHeader
          title="Analytics Dashboard"
          description="Exam performance insights, trends, and export tools"
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => void handleExport('csv')}
              >
                <Download className="size-4" />
                Export CSV
              </Button>
              <Button
                className="rounded-xl bg-primary hover:bg-primary/90"
                onClick={() => void handleExport('pdf')}
              >
                <Download className="size-4" />
                Export PDF
              </Button>
            </div>
          }
        />

        {message && (
          <div className="dashboard-panel border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {message}
          </div>
        )}

        <div className="dashboard-panel flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <label className="text-sm font-medium text-foreground">Exam</label>
          <select
            className="rounded-xl border border-border bg-input px-3 py-2 text-sm"
            value={selectedExamId}
            onChange={(event) => setSelectedExamId(event.target.value)}
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.courseCode})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Average Score" value={`${analytics.averageScore.toFixed(1)}%`} color="primary" />
          <StatCard label="Pass Rate" value={`${analytics.passRate.toFixed(1)}%`} color="secondary" />
          <StatCard
            label="Excellence Rate"
            value={`${(analytics.excellenceRate ?? 0).toFixed(1)}%`}
            color="accent"
          />
          <StatCard
            label="At-Risk Rate"
            value={`${(analytics.atRiskRate ?? 0).toFixed(1)}%`}
            color="primary"
          />
        </div>

        {isLoading ? (
          <div className="dashboard-panel p-8 text-sm text-muted-foreground">
            Loading analytics...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="dashboard-panel p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Grade Distribution
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={analytics.gradeDistribution}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={46}
                      outerRadius={96}
                    >
                      {analytics.gradeDistribution.map((entry, index) => (
                        <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="dashboard-panel p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Trend
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={analytics.trend}>
                    <CartesianGrid stroke="#dbe4f2" strokeDasharray="3 3" />
                    <XAxis dataKey="label" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#1f4ed8"
                      strokeWidth={2.5}
                      dot={{ fill: '#1f4ed8', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-panel p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Question Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.questionPerformance}>
                  <CartesianGrid stroke="#dbe4f2" strokeDasharray="3 3" />
                  <XAxis dataKey="question" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#1f4ed8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </LayoutWrapper>
  )
}
