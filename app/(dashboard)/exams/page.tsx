'use client'

import { useEffect, useMemo, useState } from 'react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { SectionHeader } from '@/components/section-header'
import { ExamCard } from '@/components/exam-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createExam, listExams, type Exam } from '@/lib/api'
import { useRealtime } from '@/hooks/useRealtime'

const fallbackExams: Exam[] = [
  {
    id: 'ex-1',
    title: 'Calculus I Midterm',
    courseCode: 'MAT101',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'completed',
    submissionCount: 45,
    gradedCount: 45,
    createdAt: '2026-02-02',
  },
  {
    id: 'ex-2',
    title: 'Physics II Final',
    courseCode: 'PHY202',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'in-progress',
    submissionCount: 52,
    gradedCount: 31,
    createdAt: '2026-02-12',
  },
  {
    id: 'ex-3',
    title: 'Chemistry Practical',
    courseCode: 'CHM150',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'pending',
    submissionCount: 38,
    gradedCount: 0,
    createdAt: '2026-02-20',
  },
]

function toLegacyStatus(
  status: string,
): 'pending' | 'in-progress' | 'completed' {
  if (status === 'completed') return 'completed'
  if (status === 'in-progress') return 'in-progress'
  return 'pending'
}

export default function ExamsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')
  const [exams, setExams] = useState<Exam[]>(fallbackExams)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newExamTitle, setNewExamTitle] = useState('')
  const [newExamCoursePrefix, setNewExamCoursePrefix] = useState('')
  const [newExamCourseNumber, setNewExamCourseNumber] = useState('')
  const [newExamSemester, setNewExamSemester] = useState('Semester 1')
  const [newExamMarks, setNewExamMarks] = useState('100')
  const [createMessage, setCreateMessage] = useState<string | null>(null)

  async function loadExams() {
    try {
      setIsLoading(true)
      const response = await listExams()
      setExams(response.length > 0 ? response : fallbackExams)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exams')
      setExams(fallbackExams)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadExams()
  }, [])

  useRealtime(
    {
      review_ready: () => void loadExams(),
      grading_progress: () => void loadExams(),
    },
    { enabled: true },
  )

  const filteredExams = useMemo(() => {
    if (filter === 'all') return exams
    return exams.filter((exam) => toLegacyStatus(String(exam.status)) === filter)
  }, [exams, filter])

  async function handleCreateExam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateMessage(null)

    const courseCode = `${newExamCoursePrefix.trim().toUpperCase()}${newExamCourseNumber.trim()}`

    const payload = new FormData()
    payload.append('course_code', courseCode)
    payload.append('course_name', newExamTitle)      // backend expects course_name, not title
    payload.append('semester', newExamSemester)
    payload.append('total_marks', newExamMarks)
    payload.append('compulsory_questions', JSON.stringify(['Q1', 'Q2']))
    payload.append('elective_questions', JSON.stringify([]))
    payload.append('elective_count', '0')
    payload.append('rubric', JSON.stringify({        // backend requires rubric
      Q1: { max: Math.floor(Number(newExamMarks) / 2), criteria: ['accuracy', 'understanding'] },
      Q2: { max: Math.ceil(Number(newExamMarks) / 2), criteria: ['accuracy', 'understanding'] },
    }))

    try {
      await createExam(payload)
      setCreateMessage('Exam created successfully.')
      setShowCreate(false)
      setNewExamTitle('')
      setNewExamCoursePrefix('')
      setNewExamCourseNumber('')
      setNewExamSemester('Semester 1')
      setNewExamMarks('100')
      await loadExams()
    } catch (err) {
      setCreateMessage(
        err instanceof Error
          ? `${err.message}. Ensure required files/fields are accepted by backend.`
          : 'Could not create exam.',
      )
    }
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <SectionHeader
          title="My Exams"
          description={`You have ${exams.length} exams in this workspace`}
          action={
            <Button
              onClick={() => setShowCreate((prev) => !prev)}
              className="rounded-xl bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              New Exam
            </Button>
          }
        />

        {error && (
          <div className="dashboard-panel border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}. Showing fallback data.
          </div>
        )}

        {createMessage && (
          <div className="dashboard-panel border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {createMessage}
          </div>
        )}

        {showCreate && (
          <form
            onSubmit={handleCreateExam}
            className="dashboard-panel grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4"
          >
            <input
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm"
              placeholder="Course name (e.g. Data Structures)"
              value={newExamTitle}
              onChange={(event) => setNewExamTitle(event.target.value)}
              required
            />
            <input
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm"
              placeholder="Course code (e.g. MATH, BIT, CS)"
              value={newExamCoursePrefix}
              onChange={(event) => setNewExamCoursePrefix(event.target.value)}
              required
            />
            <input
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm"
              placeholder="Course number (e.g. 114, 301)"
              value={newExamCourseNumber}
              onChange={(event) => setNewExamCourseNumber(event.target.value)}
              required
            />
            <input
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm"
              placeholder="Semester"
              value={newExamSemester}
              onChange={(event) => setNewExamSemester(event.target.value)}
              required
            />
            <input
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm"
              type="number"
              min={1}
              placeholder="Total marks"
              value={newExamMarks}
              onChange={(event) => setNewExamMarks(event.target.value)}
              required
            />
            <div className="md:col-span-2 lg:col-span-4 flex gap-2">
              <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90">
                Create
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'in-progress', 'completed'].map((f) => {
            const label = f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')
            return (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-foreground border border-border hover:bg-muted'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="dashboard-panel p-8 text-sm text-muted-foreground">
            Loading exams...
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="dashboard-panel p-8 text-sm text-muted-foreground">
            No exams found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredExams.map((exam) => {
              const students = exam.submissionCount ?? 0
              const graded = exam.gradedCount ?? 0
              const progress = students > 0 ? Math.round((graded / students) * 100) : 0
              return (
                <ExamCard
                  key={exam.id}
                  id={exam.id}
                  title={exam.title}
                  course={exam.courseCode}
                  date={exam.createdAt ?? 'N/A'}
                  students={students}
                  graded={graded}
                  status={toLegacyStatus(String(exam.status))}
                  progress={progress}
                />
              )
            })}
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
