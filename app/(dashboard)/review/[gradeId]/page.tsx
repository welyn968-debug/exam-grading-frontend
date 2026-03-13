'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, ZoomIn, ZoomOut, ArrowLeft, Loader2, ChevronRight } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { getGrade, listExamGrades, updateGrade } from '@/lib/api/grades'
import type { Grade } from '@/lib/api'

type PageProps = {
  params: { gradeId: string }
}

const placeholderImage =
  'public/papers/reseach_paper.png'

const rubricChecks = [
  'Addresses key concepts',
  'Work shown / reasoning clear',
  'Terminology accuracy',
  'Final answer correctness',
]

export default function GradeReviewPage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const examId = searchParams.get('examId')

  const [grade, setGrade] = useState<Grade | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [finalScore, setFinalScore] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [zoom, setZoom] = useState(100)
  const [pendingGrades, setPendingGrades] = useState<Grade[]>([])
  const [actionBusy, setActionBusy] = useState(false)

  const gradeId = params.gradeId

  useEffect(() => {
    async function loadGrade() {
      setLoading(true)
      setError(null)
      try {
        const response = await getGrade(gradeId)
        setGrade(response)
        setFinalScore(String(response.finalScore ?? response.aiScore ?? ''))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load grade details. Showing fallback sample.',
        )
        setGrade({
          id: gradeId,
          registrationNumber: '2021-BIT-045',
          finalScore: 17,
          aiScore: 17,
          confidenceScore: 82,
          needsReview: true,
          aiReasoning:
            'Student explains supply and demand correctly, minor omission on equilibrium point.',
          questionNum: 'Q1',
          questionType: 'compulsory',
          status: 'pending',
          studentName: 'John Kipkemboi',
          ocrText:
            'Student explains supply and demand curves, mentions equilibrium price but omits graph labelling.',
          scanUrl: placeholderImage,
        })
        setFinalScore('17')
      } finally {
        setLoading(false)
      }
    }

    void loadGrade()
  }, [gradeId])

  useEffect(() => {
    if (!examId) return
    async function loadPending() {
      try {
        const response = await listExamGrades(examId, { needsReview: true })
        const pending = response.filter((g) => (g.status ?? 'pending') === 'pending')
        setPendingGrades(pending)
      } catch {
        setPendingGrades([])
      }
    }
    void loadPending()
  }, [examId])

  const confidenceTone = useMemo(() => {
    const value = grade?.confidenceScore ?? 0
    if (value >= 85) return 'text-emerald-700 bg-emerald-50'
    if (value >= 70) return 'text-amber-700 bg-amber-50'
    return 'text-red-700 bg-red-50'
  }, [grade?.confidenceScore])

  const scanUrl = grade?.scanUrl ?? placeholderImage
  const ocrText =
    grade?.ocrText ??
    'OCR text not available yet. Please verify the scan and approve or override as needed.'

  async function handleApprove() {
    if (!gradeId) return
    setActionBusy(true)
    setMessage(null)
    try {
      const updated = await updateGrade(gradeId, {
        final_score: Number(finalScore || grade?.finalScore || 0),
        status: 'reviewed',
      })
      setGrade(updated)
      setPendingGrades((prev) => prev.filter((g) => g.id !== gradeId))
      setMessage('Grade approved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve grade.')
    } finally {
      setActionBusy(false)
    }
  }

  async function handleOverride() {
    if (!gradeId) return
    setActionBusy(true)
    setMessage(null)
    try {
      const updated = await updateGrade(gradeId, {
        final_score: Number(finalScore || grade?.finalScore || 0),
        override_reason: overrideReason,
        status: 'reviewed',
      })
      setGrade(updated)
      setPendingGrades((prev) => prev.filter((g) => g.id !== gradeId))
      setMessage('Override saved and grade marked reviewed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to override grade.')
    } finally {
      setActionBusy(false)
    }
  }

  function handleNext() {
    if (!examId || pendingGrades.length === 0) return
    const idx = pendingGrades.findIndex((g) => g.id === gradeId)
    const next = pendingGrades[(idx === -1 ? 0 : (idx + 1) % pendingGrades.length)]
    router.push(`/review/${next.id}?examId=${encodeURIComponent(examId)}`)
  }

  function handleClose() {
    router.push(examId ? `/review?examId=${encodeURIComponent(examId)}` : '/review')
  }

  return (
    <LayoutWrapper>
      <div className="space-y-4 pb-28 px-1 sm:px-2 lg:px-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="rounded-lg" onClick={handleClose}>
            <ArrowLeft className="h-4 w-4" />
            Back to review list
          </Button>
          {examId && (
            <Badge variant="outline" className="border-border">
              Exam {examId}
            </Badge>
          )}
          {grade?.questionNum && (
            <Badge variant="secondary" className="border-0">
              Question {grade.questionNum}
            </Badge>
          )}
        </div>

        {(error || message) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
          >
            {error ?? message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 min-h-[calc(100vh-220px)]">
          {/* Scan column */}
          <div className="lg:col-span-4 rounded-xl border border-border bg-muted/40 p-3 flex flex-col">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Scanned answer</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md p-1 hover:bg-muted"
                  onClick={() => setZoom((z) => Math.max(60, z - 10))}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-[11px]">{zoom}%</span>
                <button
                  type="button"
                  className="rounded-md p-1 hover:bg-muted"
                  onClick={() => setZoom((z) => Math.min(200, z + 10))}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-auto rounded-lg border border-border bg-white h-full max-h-[calc(100vh-280px)]">
              <img
                src={scanUrl}
                alt="Student answer"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                className="origin-top-left"
              />
            </div>
          </div>

          {/* OCR + reasoning */}
          <div className="lg:col-span-5 rounded-xl border border-border bg-white p-4 space-y-4 flex flex-col">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">OCR TEXT</p>
              <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground">
                {loading ? 'Loading OCR...' : ocrText}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                AI REASONING
              </p>
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
                {loading
                  ? 'Loading reasoning...'
                  : grade?.aiReasoning ?? 'LLM reasoning will appear here once available.'}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Rubric Checklist
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {rubricChecks.map((item) => (
                  <label
                    key={item}
                    className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <input type="checkbox" className="mt-1 rounded border-border text-primary" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-white p-4 space-y-4 flex flex-col">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">AI Score</p>
              <p className="text-2xl font-bold text-emerald-700">
                {loading ? '--' : `${grade?.aiScore ?? grade?.finalScore ?? '--'}`}/20
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Confidence</span>
                <Progress value={grade?.confidenceScore ?? 0} />
                {grade?.confidenceScore !== undefined && (
                  <Badge className={`${confidenceTone} border-0`}>
                    {grade.confidenceScore}%
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalScore">Final score</Label>
              <Input
                id="finalScore"
                type="number"
                min={0}
                value={finalScore}
                onChange={(event) => setFinalScore(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overrideReason">Override reason (optional)</Label>
              <Textarea
                id="overrideReason"
                rows={3}
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
                placeholder="e.g. Student showed working but minor arithmetic slip."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading grade...
              </span>
            ) : (
              <span>
                {grade?.registrationNumber ?? 'Student'}{' '}
                {grade?.questionNum ? `• ${grade.questionNum}` : ''}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => void handleApprove()}
              disabled={actionBusy || loading}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => void handleOverride()}
              disabled={actionBusy || loading}
            >
              Override
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setMessage('Apply to similar answers coming soon.')}
              disabled={loading}
            >
              Apply to Similar Answers
            </Button>
            <Button variant="ghost" className="rounded-xl" onClick={handleClose}>
              Close
            </Button>
            <Button
              className="rounded-xl bg-muted text-foreground hover:bg-muted/80"
              onClick={handleNext}
              disabled={!examId || pendingGrades.length === 0}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
