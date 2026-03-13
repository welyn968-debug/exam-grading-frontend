'use client'

import { useEffect, useMemo, useState } from 'react'
import { ZoomIn, ZoomOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { getGrade, updateGrade } from '@/lib/api/grades'
import type { Grade } from '@/lib/api'

type GradeDetailModalProps = {
  gradeId: string | null
  open: boolean
  onClose: () => void
  onUpdated?: (grade: Grade) => void
}

const placeholderImage =
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'

export function GradeDetailModal({
  gradeId,
  open,
  onClose,
  onUpdated,
}: GradeDetailModalProps) {
  const [grade, setGrade] = useState<Grade | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [finalScore, setFinalScore] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [zoom, setZoom] = useState(100)
  const [actionBusy, setActionBusy] = useState(false)

  useEffect(() => {
    async function loadGrade() {
      if (!gradeId || !open) return
      setLoading(true)
      setError(null)
      try {
        const response = await getGrade(gradeId)
        setGrade(response)
        setFinalScore(String(response.finalScore ?? response.aiScore ?? 0))
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
        })
        setFinalScore('17')
      } finally {
        setLoading(false)
      }
    }
    void loadGrade()
  }, [gradeId, open])

  const confidenceTone = useMemo(() => {
    const value = grade?.confidenceScore ?? 0
    if (value >= 85) return 'text-emerald-700 bg-emerald-50'
    if (value >= 70) return 'text-amber-700 bg-amber-50'
    return 'text-red-700 bg-red-50'
  }, [grade?.confidenceScore])

  const rubricChecks = [
    'Addresses key concepts',
    'Work shown / reasoning clear',
    'Terminology accuracy',
    'Final answer correctness',
  ]

  async function handleApprove() {
    if (!gradeId) return
    setActionBusy(true)
    try {
      const updated = await updateGrade(gradeId, {
        final_score: Number(finalScore || grade?.finalScore || 0),
        status: 'reviewed',
      })
      setGrade(updated)
      onUpdated?.(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve grade.')
    } finally {
      setActionBusy(false)
    }
  }

  async function handleOverride() {
    if (!gradeId) return
    setActionBusy(true)
    try {
      const updated = await updateGrade(gradeId, {
        final_score: Number(finalScore || grade?.finalScore || 0),
        override_reason: overrideReason,
        status: 'reviewed',
      })
      setGrade(updated)
      onUpdated?.(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to override grade.')
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              Grade detail • {grade?.registrationNumber ?? 'Student'}
              {grade?.questionNum ? ` • ${grade.questionNum}` : ''}
            </div>
            {grade?.confidenceScore !== undefined && (
              <Badge className={`${confidenceTone} border-0`}>
                Confidence {grade.confidenceScore}%
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Scan column */}
          <div className="lg:col-span-4 rounded-xl border border-border bg-muted/40 p-3">
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
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <img
                src={placeholderImage}
                alt="Student answer"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                className="origin-top-left"
              />
            </div>
          </div>

          {/* OCR + reasoning */}
          <div className="lg:col-span-5 rounded-xl border border-border bg-white p-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                OCR TEXT
              </p>
              <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground">
                {loading
                  ? 'Loading OCR...'
                  : 'Student explains supply and demand curves, mentions equilibrium price but omits graph labelling.'}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                AI REASONING
              </p>
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
                {grade?.aiReasoning ??
                  'LLM reasoning will appear here once the backend returns it.'}
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
          <div className="lg:col-span-3 rounded-xl border border-border bg-white p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">AI Score</p>
              <p className="text-2xl font-bold text-emerald-700">
                {grade?.aiScore ?? grade?.finalScore ?? '--'}/20
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Confidence</span>
                <Progress value={grade?.confidenceScore ?? 0} />
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

            <div className="flex flex-col gap-2">
              <Button
                className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => void handleApprove()}
                disabled={actionBusy}
              >
                Approve
              </Button>
              <Button
                className="w-full rounded-xl bg-accent text-white hover:bg-accent/90"
                onClick={() => void handleOverride()}
                disabled={actionBusy}
              >
                Override
              </Button>
              <Button variant="outline" className="w-full rounded-xl" disabled>
                Apply to Similar Answers
              </Button>
              <Button variant="ghost" className="w-full rounded-xl" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
