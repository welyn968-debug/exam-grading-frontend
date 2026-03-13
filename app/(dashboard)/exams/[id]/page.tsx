'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Plus, Upload, X } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getExam, type Exam, updateExam } from '@/lib/api'
import { useRealtime } from '@/hooks/useRealtime'

type RubricRow = {
  id: number
  criteria: string
  maxMarks: number
  description: string
}

type ExamDetailPageProps = {
  params: {
    id: string
  }
}

const fallbackExam: Exam = {
  id: 'fallback',
  title: 'Physics II Final Exam',
  courseCode: 'PHY202',
  semester: 'Semester 1',
  totalMarks: 100,
  status: 'ready',
  submissionCount: 52,
  gradedCount: 11,
}

export default function ExamDetailPage({ params }: ExamDetailPageProps) {
  const [step, setStep] = useState(1)
  const [exam, setExam] = useState<Exam>(fallbackExam)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [answerScript, setAnswerScript] = useState<File | null>(null)
  const [answerType, setAnswerType] = useState<'typed' | 'scanned'>('typed')
  const [ocrPreview, setOcrPreview] = useState<string | null>(null)
  const [rubrics, setRubrics] = useState<RubricRow[]>([
    { id: 1, criteria: 'Clarity', maxMarks: 10, description: 'How clear the answer is' },
  ])
  const [newCriteria, setNewCriteria] = useState('')
  const [newMaxMarks, setNewMaxMarks] = useState('')
  const [questionRules, setQuestionRules] = useState({
    compulsory: ['Q1', 'Q2', 'Q3'],
    elective: ['Q4', 'Q5', 'Q6'],
    electiveCount: 2,
  })
  const [formState, setFormState] = useState({
    title: fallbackExam.title,
    courseCode: fallbackExam.courseCode,
    semester: fallbackExam.semester,
    totalMarks: String(fallbackExam.totalMarks),
  })

  async function loadExam() {
    try {
      setIsLoading(true)
      const response = await getExam(params.id)
      setExam(response)
      setFormState({
        title: response.title,
        courseCode: response.courseCode,
        semester: response.semester,
        totalMarks: String(response.totalMarks),
      })
      setNotice(null)
    } catch (err) {
      setExam({ ...fallbackExam, id: params.id })
      setNotice(err instanceof Error ? `${err.message}. Using fallback detail.` : 'Using fallback detail.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadExam()
  }, [params.id])

  useRealtime(
    {
      ocr_progress: () => setNotice('OCR in progress...'),
      grading_progress: () => setNotice('Grading progress updated.'),
      review_ready: () => {
        setNotice('Review queue is ready for this exam.')
        void loadExam()
      },
    },
    { enabled: true },
  )

  const totalMarks = useMemo(
    () => rubrics.reduce((sum, rubric) => sum + rubric.maxMarks, 0),
    [rubrics],
  )

  const steps = [
    'Basic Info',
    'Answer Script',
    'Rubric Builder',
    'Question Rules',
    'Review & Save',
  ]

  function addRubric() {
    const parsed = Number(newMaxMarks)
    if (!newCriteria.trim() || Number.isNaN(parsed) || parsed <= 0) return
    setRubrics((prev) => [
      ...prev,
      { id: Date.now(), criteria: newCriteria, maxMarks: parsed, description: '' },
    ])
    setNewCriteria('')
    setNewMaxMarks('')
  }

  function removeRubric(id: number) {
    setRubrics((prev) => prev.filter((row) => row.id !== id))
  }

  async function handleSaveBasic() {
    try {
      const updated = await updateExam(params.id, {
        title: formState.title,
        course_code: formState.courseCode,
        semester: formState.semester,
        total_marks: Number(formState.totalMarks),
      })
      setExam(updated)
      setNotice('Basic information saved.')
      setStep(2)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to save exam data.')
    }
  }

  async function handleSaveAnswerScript() {
    if (!answerScript) {
      setNotice('Select an answer script (PDF/image) to continue.')
      return
    }
    setNotice('Answer script saved for this session. Remember to finalize to persist.')
    setStep(3)
  }

  async function handleFinalize() {
    try {
      await updateExam(params.id, {
        status: 'ready',
        total_marks: Number(formState.totalMarks),
        rubric: rubrics.map((rubric) => ({
          criteria: rubric.criteria,
          max_marks: rubric.maxMarks,
          description: rubric.description,
        })),
        compulsory_questions: questionRules.compulsory,
        elective_questions: questionRules.elective,
        elective_count: questionRules.electiveCount,
      })
      setNotice('Exam finalized and ready for grading.')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Finalization failed.')
    }
  }

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="dashboard-panel flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{exam.title}</h1>
            <p className="text-sm text-muted-foreground">
              {exam.courseCode} • {exam.semester}
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-0 px-3 py-1">
            {String(exam.status)}
          </Badge>
        </div>

        {isLoading && (
          <div className="dashboard-panel p-4 text-sm text-muted-foreground">
            Loading exam configuration...
          </div>
        )}

        {notice && (
          <div className="dashboard-panel border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {notice}
          </div>
        )}

        <div className="dashboard-panel flex flex-wrap items-center gap-3 p-4">
          {steps.map((label, index) => {
            const value = index + 1
            const active = step === value
            const done = step > value
            return (
              <div key={label} className="flex items-center gap-2">
                <button
                  className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold ${
                    done
                      ? 'bg-primary text-primary-foreground'
                      : active
                        ? 'bg-accent text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                  onClick={() => setStep(value)}
                  aria-label={label}
                >
                  {done ? <Check className="h-4 w-4" /> : value}
                </button>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </div>
            )
          })}
        </div>

        {step === 1 && (
          <div className="dashboard-panel space-y-5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
            <FormField
              label="Exam Title"
              name="title"
              value={formState.title}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Course Code"
                name="courseCode"
                value={formState.courseCode}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, courseCode: event.target.value }))
                }
              />
              <FormField
                label="Semester"
                name="semester"
                value={formState.semester}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, semester: event.target.value }))
                }
              />
            </div>
            <FormField
              label="Total Marks"
              name="totalMarks"
              type="number"
              value={formState.totalMarks}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, totalMarks: event.target.value }))
              }
            />
            <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={handleSaveBasic}>
              Save & Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="dashboard-panel space-y-5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Answer Script</h2>
            <div className="flex flex-wrap gap-3">
              {['typed', 'scanned'].map((value) => (
                <button
                  key={value}
                  onClick={() => setAnswerType(value as typeof answerType)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    answerType === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted'
                  }`}
                >
                  {value === 'typed' ? 'Typed PDF' : 'Scanned (needs OCR)'}
                </button>
              ))}
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5 p-10 text-center">
              <Upload className="mb-3 size-10 text-primary" />
              <p className="text-sm font-medium text-foreground">
                Upload answer script ({answerType === 'typed' ? 'PDF/Doc' : 'scanned image/PDF'})
              </p>
              <p className="text-xs text-muted-foreground">Max 500 MB</p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(event) => setAnswerScript(event.target.files?.[0] ?? null)}
              />
            </label>

            {answerScript && (
              <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                Selected: {answerScript.name} ({(answerScript.size / 1024 / 1024).toFixed(1)} MB)
              </div>
            )}

            {answerType === 'scanned' && (
              <div className="space-y-2 rounded-xl border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">OCR Preview</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() =>
                      setOcrPreview(
                        'Question 1: Define supply and demand. Sample OCR output shows readable text.',
                      )
                    }
                  >
                    Run OCR sample
                  </Button>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  {ocrPreview ??
                    'OCR text will appear here after processing. You can edit before saving.'}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={handleSaveAnswerScript}>
                Save & Continue
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="dashboard-panel space-y-5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Create Rubric</h2>
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
              Total rubric marks: <span className="font-semibold">{totalMarks}</span>
            </div>
            <div className="space-y-3">
              {rubrics.map((rubric) => (
                <div key={rubric.id} className="rounded-xl border border-border bg-white px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{rubric.criteria}</p>
                      <p className="text-xs text-muted-foreground">
                        Max marks: {rubric.maxMarks}
                      </p>
                    </div>
                    <button
                      onClick={() => removeRubric(rubric.id)}
                      className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border-2 border-dashed border-border p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-xl border border-border bg-input px-3 py-2 text-sm"
                  placeholder="Criteria name"
                  value={newCriteria}
                  onChange={(event) => setNewCriteria(event.target.value)}
                />
                <input
                  className="rounded-xl border border-border bg-input px-3 py-2 text-sm"
                  type="number"
                  placeholder="Max marks"
                  value={newMaxMarks}
                  onChange={(event) => setNewMaxMarks(event.target.value)}
                />
                <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={addRubric}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={() => setStep(4)}>
                Continue
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setStep(2)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="dashboard-panel space-y-5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Question Rules</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Compulsory Questions (comma separated)"
                name="compulsory"
                value={questionRules.compulsory.join(', ')}
                onChange={(event) =>
                  setQuestionRules((prev) => ({
                    ...prev,
                    compulsory: event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  }))
                }
              />
              <FormField
                label="Elective Questions (comma separated)"
                name="elective"
                value={questionRules.elective.join(', ')}
                onChange={(event) =>
                  setQuestionRules((prev) => ({
                    ...prev,
                    elective: event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>
            <FormField
              label="Elective questions to answer"
              name="electiveCount"
              type="number"
              value={String(questionRules.electiveCount)}
              onChange={(event) =>
                setQuestionRules((prev) => ({
                  ...prev,
                  electiveCount: Number(event.target.value),
                }))
              }
            />
            <div className="flex gap-2">
              <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={() => setStep(5)}>
                Continue
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setStep(3)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="dashboard-panel space-y-5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Review & Submit</h2>
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4 text-sm">
              <p><span className="font-medium">Exam:</span> {formState.title}</p>
              <p><span className="font-medium">Course:</span> {formState.courseCode}</p>
              <p><span className="font-medium">Total Marks:</span> {formState.totalMarks}</p>
              <p><span className="font-medium">Rubric Lines:</span> {rubrics.length}</p>
              <p>
                <span className="font-medium">Compulsory:</span>{' '}
                {questionRules.compulsory.join(', ')}
              </p>
              <p>
                <span className="font-medium">Electives:</span>{' '}
                {questionRules.elective.join(', ')} (pick {questionRules.electiveCount})
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={handleFinalize}>
                Submit & Start Grading
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => (window.location.href = `/exams/${params.id}/upload`)}
              >
                Go to Bulk Upload
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setStep(4)}>
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
