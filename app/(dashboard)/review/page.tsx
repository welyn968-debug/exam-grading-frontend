'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Eye, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { SectionHeader } from '@/components/section-header'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  bulkApproveGrades,
  listExamGrades,
  listExams,
  type Exam,
  type Grade,
  updateGrade,
} from '@/lib/api'
import { useRealtime } from '@/hooks/useRealtime'

const fallbackExams: Exam[] = [
  {
    id: 'exam-fallback-1',
    title: 'Calculus I Midterm',
    courseCode: 'MAT101',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'in-progress',
    submissionCount: 45,
  },
]

const fallbackGrades: Grade[] = [
  {
    id: 'grade-1',
    registrationNumber: '2021-BIT-045',
    finalScore: 18,
    confidenceScore: 88,
    needsReview: true,
    status: 'pending',
    studentName: 'John Kipkemboi',
    questionNum: 'Q1',
  },
  {
    id: 'grade-2',
    registrationNumber: '2021-BIT-046',
    finalScore: 14,
    confidenceScore: 72,
    needsReview: true,
    status: 'flagged',
    studentName: 'Mary Kipchoge',
    questionNum: 'Q2',
  },
]

function statusBadge(status: string) {
  if (status === 'reviewed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'flagged') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

export default function ReviewPage() {
  const [exams, setExams] = useState<Exam[]>(fallbackExams)
  const [selectedExamId, setSelectedExamId] = useState<string>(fallbackExams[0].id)
  const [grades, setGrades] = useState<Grade[]>(fallbackGrades)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'flagged' | 'high'>('pending')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

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

  async function loadGrades(examId: string) {
    try {
      setIsLoading(true)
      const response = await listExamGrades(examId, {needsReview: false})
        setGrades(response.length > 0 ? response : fallbackGrades)
      setMessage(null)
    } catch (err) {
      setGrades(fallbackGrades)
      setMessage(
        err instanceof Error
          ? `${err.message}. Showing fallback review data.`
          : 'Showing fallback review data.',
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
    void loadGrades(selectedExamId)
  }, [selectedExamId])

  useRealtime(
    {
      review_ready: () => {
        if (selectedExamId) void loadGrades(selectedExamId)
      },
      grading_progress: () => {
        if (selectedExamId) void loadGrades(selectedExamId)
      },
    },
    { enabled: Boolean(selectedExamId) },
  )

  const filteredGrades = useMemo(() => {
    const base = grades.filter((grade) => {
      const haystack = `${grade.registrationNumber} ${grade.studentName ?? ''} ${grade.questionNum ?? ''}`.toLowerCase()
      return haystack.includes(search.toLowerCase())
    })

    if (filter === 'all') return base
    if (filter === 'high') return base.filter((grade) => (grade.confidenceScore ?? 0) >= 85)
    return base.filter((grade) => (grade.status ?? 'pending') === filter)
  }, [filter, grades, search])

  const pendingCount = grades.filter((grade) => (grade.status ?? 'pending') === 'pending').length

  async function handleApprove(grade: Grade) {
    try {
      await updateGrade(grade.id, { action: 'approve' })
      setMessage(`Grade approved.`)
      if (selectedExamId) await loadGrades(selectedExamId)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not approve grade.')
    }
  }

  async function handleBulkApprove() {
    if (!selectedExamId) return
    try {
      await bulkApproveGrades(selectedExamId, { confidence_gt: 85 })
      setMessage('Bulk approval submitted.')
      await loadGrades(selectedExamId)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Bulk approval failed.')
    }
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <SectionHeader
          title="Review Grades"
          description={`${pendingCount} submissions waiting for review`}
          action={
            <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={handleBulkApprove}>
              <CheckCircle2 className="size-4" />
              Bulk Approve &gt;85%
            </Button>
          }
        />

        {message && (
          <div className="dashboard-panel border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {message}
          </div>
        )}

        <div className="dashboard-panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search reg no. or question"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="dashboard-panel p-4 text-center">
            <p className="text-xs text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-semibold text-foreground">
              {grades.filter((grade) => (grade.status ?? 'pending') === 'pending').length}
            </p>
          </div>
          <div className="dashboard-panel p-4 text-center">
            <p className="text-xs text-muted-foreground">Reviewed</p>
            <p className="text-2xl font-semibold text-foreground">
              {grades.filter((grade) => (grade.status ?? 'pending') === 'reviewed').length}
            </p>
          </div>
          <div className="dashboard-panel p-4 text-center">
            <p className="text-xs text-muted-foreground">Flagged</p>
            <p className="text-2xl font-semibold text-foreground">
              {grades.filter((grade) => (grade.status ?? 'pending') === 'flagged').length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'reviewed', 'flagged', 'high'].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                filter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-white text-foreground hover:bg-muted'
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        <div className="dashboard-panel border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          High-confidence answers available. Bulk-approve &gt;85% or open individual answers to
          spot-check before releasing results.
        </div>

        <DataTable
          columns={[
            {
              key: 'studentName',
              label: 'Student',
              render: (value: string, row: Grade) => (
                <div>
                  <p className="font-medium text-foreground">{value ?? row.registrationNumber}</p>
                  <p className="text-xs text-muted-foreground">{row.registrationNumber}</p>
                </div>
              ),
            },
            { key: 'questionNum', label: 'Question' },
            {
              key: 'confidenceScore',
              label: 'Confidence',
              render: (value: number) => (
                <span className="font-medium">{value}%</span>
              ),
            },
            {
              key: 'finalScore',
              label: 'Score',
              render: (value: number) => <span>{value}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => (
                <Badge className={`${statusBadge(value ?? 'pending')} border-0`}>{value ?? 'pending'}</Badge>
              ),
            },
          ]}
          data={isLoading ? [] : filteredGrades}
          rowKey="id"
          actions={(row) => (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() =>
                  router.push(
                    selectedExamId
                      ? `/review/${row.id}?examId=${encodeURIComponent(selectedExamId)}`
                      : `/review/${row.id}`,
                  )
                }
              >
                <Eye className="size-3.5" />
                View
              </Button>
              <Button
                size="sm"
                className="rounded-lg bg-primary hover:bg-primary/90"
                onClick={() => void handleApprove(row)}
              >
                Approve
              </Button>
            </div>
          )}
        />
      </div>
    </LayoutWrapper>
  )
}
