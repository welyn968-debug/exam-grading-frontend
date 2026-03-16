'use client'

import { use, useEffect, useMemo, useState } from 'react'
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
  params: Promise<{ gradeId: string }>
}

const placeholderImage =
  'data:image/jpeg;base64,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'

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
  const { gradeId } = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [finalScore, setFinalScore] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [zoom, setZoom] = useState(100)
  const [pendingGrades, setPendingGrades] = useState<Grade[]>([])
  const [actionBusy, setActionBusy] = useState(false)

  const [grade, setGrade] = useState<Grade | null>(null)

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
        action: 'approve',
        final_score: Number(finalScore || grade?.finalScore || 0),
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
        action: 'override',
        final_score: Number(finalScore || grade?.finalScore || 0),
        override_reason: overrideReason || 'Manual override by reviewer',
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
