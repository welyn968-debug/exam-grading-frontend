'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FlaskConical,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
  Undo2,
} from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  approveTestingRun,
  getLatestTestingRun,
  listSampleResults,
  rerunTesting,
  startTestingRun,
} from '@/lib/api/testing'
import { getExam, updateExam, type Exam, type SampleTestResult, type TestingRun } from '@/lib/api'
import { useRealtime } from '@/hooks/useRealtime'

const placeholderScan =
  'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80'

const fallbackSamples: SampleTestResult[] = [
  {
    id: 'sample-1',
    registrationNumber: '2021-BIT-045',
    aiScore: 17,
    expectedScore: 18,
    delta: -1,
    confidenceScore: 82,
    status: 'pending',
    aiReasoning: 'Covers demand/supply graph, minor label missing.',
    ocrText: 'Student explains supply and demand curves...',
    scanUrl: placeholderScan,
    verdict: null,
  },
  {
    id: 'sample-2',
    registrationNumber: '2021-BIT-046',
    aiScore: 14,
    expectedScore: 15,
    delta: -1,
    confidenceScore: 76,
    status: 'pending',
    aiReasoning: 'Reasoning adequate, computation slip on final value.',
    ocrText: 'Answer mentions key formula but misses unit.',
    scanUrl: placeholderScan,
    verdict: null,
  },
  {
    id: 'sample-3',
    registrationNumber: '2021-BIT-047',
    aiScore: 19,
    expectedScore: 19,
    delta: 0,
    confidenceScore: 91,
    status: 'pending',
    aiReasoning: 'Complete, concise, shows working.',
    ocrText: 'Clear handwriting; all steps present.',
    scanUrl: placeholderScan,
    verdict: 'yes',
  },
]

const fallbackRun: TestingRun = {
  id: 'fallback-run',
  examId: 'fallback',
  stage: 'review',
  totalSamples: fallbackSamples.length,
  ocrCompleted: fallbackSamples.length,
  gradingCompleted: fallbackSamples.length,
  status: 'ready-for-review',
}

export default function ExamTestingSetupPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const examId = id

  const [exam, setExam] = useState<Exam | null>(null)
  const [run, setRun] = useState<TestingRun | null>(null)
  const [samples, setSamples] = useState<SampleTestResult[]>(fallbackSamples)
  const [selectedId, setSelectedId] = useState<string>(fallbackSamples[0].id)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [stage, setStage] = useState<'idle' | 'uploading' | 'ocr' | 'grading' | 'review' | 'approved'>('idle')

  const selectedSample = useMemo(
    () => samples.find((sample) => sample.id === selectedId) ?? samples[0],
    [samples, selectedId],
  )

  const totalSamples = run?.totalSamples ?? samples.length
  const ocrPercent = totalSamples
    ? Math.min(100, Math.round(((run?.ocrCompleted ?? 0) / totalSamples) * 100))
    : stage === 'ocr'
      ? 40
      : 0
  const gradingPercent = totalSamples
    ? Math.min(100, Math.round(((run?.gradingCompleted ?? 0) / totalSamples) * 100))
    : stage === 'grading'
      ? 15
      : 0

  const reviewedCount = samples.filter((sample) => sample.verdict === 'yes').length
  const flaggedCount = samples.filter((sample) => sample.verdict === 'no').length

  const headerStatus =
    stage === 'approved' ? 'Approved' : stage === 'review' ? 'Testing' : 'In progress'

  async function loadExam() {
    try {
      const response = await getExam(examId)
      setExam(response)
      window.localStorage.setItem('last_exam_for_setup', examId)
    } catch (err) {
      setExam({
        id: examId,
        title: 'Untitled Exam',
        courseCode: 'N/A',
        semester: 'Current',
        totalMarks: 100,
        status: 'pending',
        submissionCount: 0,
      })
      setNotice(err instanceof Error ? err.message : 'Using fallback exam info.')
    }
  }

  const loadRunAndSamples = useCallback(async () => {
    try {
      const latest = await getLatestTestingRun(examId)
      if (latest) {
        setRun(latest)
        setStage((latest.stage as typeof stage) ?? 'review')
        const rows = await listSampleResults(examId, latest.id)
        setSamples(rows.length ? rows : fallbackSamples)
        setSelectedId((rows[0] ?? fallbackSamples[0]).id)
      } else {
        setRun(null)
        setStage('idle')
        setSamples(fallbackSamples)
        setSelectedId(fallbackSamples[0].id)
      }
    } catch (err) {
      setRun(fallbackRun)
      setStage('review')
      setSamples(fallbackSamples)
      setNotice(err instanceof Error ? err.message : 'Showing sample testing data.')
    }
  }, [examId])

  useEffect(() => {
    void loadExam()
    void loadRunAndSamples()
  }, [loadRunAndSamples])

  useRealtime(
    {
      testing_ocr_progress: (payload) => {
        if (!payload || typeof payload !== 'object') return
        const data = payload as { completed?: number; total?: number }
        setRun((prev) => ({
          ...(prev ?? { ...fallbackRun, examId }),
          ocrCompleted: data.completed ?? prev?.ocrCompleted ?? 0,
          totalSamples: data.total ?? prev?.totalSamples ?? fallbackSamples.length,
          stage: 'ocr',
        }))
        setStage('ocr')
      },
      testing_grading_progress: (payload) => {
        if (!payload || typeof payload !== 'object') return
        const data = payload as { completed?: number; total?: number }
        setRun((prev) => ({
          ...(prev ?? { ...fallbackRun, examId }),
          gradingCompleted: data.completed ?? prev?.gradingCompleted ?? 0,
          totalSamples: data.total ?? prev?.totalSamples ?? fallbackSamples.length,
          stage: 'grading',
        }))
        setStage('grading')
      },
      testing_complete: () => {
        setStage('review')
        void loadRunAndSamples()
      },
    },
    { enabled: true, namespace: '/testing' },
  )

  useEffect(() => {
    if (stage === 'ocr' || stage === 'grading') {
      const timer = setInterval(() => {
        setRun((prev) => {
          if (!prev) return prev
          const key = stage === 'ocr' ? 'ocrCompleted' : 'gradingCompleted'
          const nextValue = Math.min((prev.totalSamples ?? 0), (prev[key] ?? 0) + 1)
          return { ...prev, [key]: nextValue }
        })
      }, 1200)
      return () => clearInterval(timer)
    }
    return undefined
  }, [stage])

  async function handleStart() {
    if (!file) {
      setNotice('Select a ZIP or multiple files first.')
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      setStage('uploading')
      const response = await startTestingRun(examId, file)
      setRun(response)
      setStage('ocr')
      setSamples([])
      setSelectedId('')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to start testing. Showing sample data.')
      setRun(fallbackRun)
      setStage('review')
      setSamples(fallbackSamples)
      setSelectedId(fallbackSamples[0].id)
    } finally {
      setBusy(false)
    }
  }

  async function handleApprove() {
    if (!run) {
      setNotice('Start a testing run first.')
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      await approveTestingRun(examId, run.id)
      await updateExam(examId, { status: 'ready' })
      setStage('approved')
      setNotice('Testing approved. Exam marked Ready for grading.')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not approve testing.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRerun() {
    setBusy(true)
    setNotice(null)
    try {
      const nextRun = await rerunTesting(examId, run?.id)
      setRun(nextRun)
      setStage('uploading')
      setSamples([])
      setSelectedId('')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not re-run testing. Reset to sample data.')
      setRun(fallbackRun)
      setStage('review')
      setSamples(fallbackSamples)
      setSelectedId(fallbackSamples[0].id)
    } finally {
      setBusy(false)
    }
  }

  function handleVerdict(id: string, verdict: 'yes' | 'no') {
    setSamples((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              verdict,
              status: verdict === 'yes' ? 'approved' : 'flagged',
            }
          : item,
      ),
    )
  }

  function handleExpectedChange(id: string, value: string) {
    const parsed = Number(value)
    setSamples((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              expectedScore: Number.isNaN(parsed) ? item.expectedScore : parsed,
              delta:
                Number.isNaN(parsed) || typeof item.aiScore !== 'number'
                  ? item.delta
                  : item.aiScore - parsed,
            }
          : item,
      ),
    )
  }

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="dashboard-panel flex flex-wrap items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FlaskConical className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exam ID: {examId}</p>
              <h1 className="text-2xl font-semibold text-foreground">
                {exam?.title ?? 'Testing & Validation'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {exam?.courseCode ?? 'N/A'} • {exam?.semester ?? 'Current'}
              </p>
            </div>
          </div>
          <Badge className="border-0 bg-amber-100 text-amber-800">{headerStatus}</Badge>
        </div>

        {notice && (
          <div className="dashboard-panel border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {notice}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="dashboard-panel space-y-4 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Upload sample scripts</h2>
                <p className="text-sm text-muted-foreground">
                  Upload 5–10 papers as ZIP (naming: STUDENTID_Page1.jpg) or multiple images/PDF.
                </p>
              </div>
              <Badge variant="outline" className="border-border bg-muted/40">
                {file ? file.name : 'ZIP up to 200 MB'}
              </Badge>
            </div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5 p-10 text-center">
              <Upload className="mb-3 h-10 w-10 text-primary" />
              <p className="text-sm font-medium text-foreground">
                Drop ZIP here or click to choose files
              </p>
              <p className="text-xs text-muted-foreground">
                We validate naming and size server-side; this is a quick pre-check.
              </p>
              <input
                type="file"
                accept=".zip,.pdf,image/*"
                multiple={false}
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null
                  setFile(selected)
                }}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-xl bg-primary hover:bg-primary/90"
                disabled={busy || !file}
                onClick={() => void handleStart()}
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Start Testing
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => router.push(`/exams/${examId}`)}>
                Refine configuration
              </Button>
              <Button variant="ghost" className="rounded-xl" onClick={() => void handleRerun()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-run test
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
              <div>
                Keep at least one compulsory and one elective question represented in the sample batch.
              </div>
            </div>
          </div>

          <div className="dashboard-panel space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Progress</h3>
              <Badge variant="outline" className="border-border bg-muted/30">
                {stage === 'approved' ? 'Done' : stage === 'review' ? 'Awaiting review' : 'Processing'}
              </Badge>
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>OCR</span>
                  <span>{ocrPercent}%</span>
                </div>
                <Progress value={ocrPercent} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Grading</span>
                  <span>{gradingPercent}%</span>
                </div>
                <Progress value={gradingPercent} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-white p-3 text-sm">
              <p className="font-semibold text-foreground">Live feed</p>
              <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  {stage === 'ocr' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <span>
                    {stage === 'ocr'
                      ? 'Running OCR on uploaded samples...'
                      : stage === 'grading'
                        ? 'LLM grading in progress...'
                        : 'Awaiting your review.'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Reviewed {reviewedCount}/{totalSamples} • Flagged {flaggedCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sample results</h2>
              <p className="text-sm text-muted-foreground">
                AI score vs expected; click a row to review the full answer.
              </p>
            </div>
            <Badge variant="outline" className="border-border bg-muted/30">
              {samples.length} samples
            </Badge>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
            <div className="grid grid-cols-6 bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Student</span>
              <span className="text-right">AI score</span>
              <span className="text-right">Expected</span>
              <span className="text-right">Δ</span>
              <span className="text-right">Confidence</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-border/60">
              {samples.map((sample) => {
                const active = sample.id === selectedId
                const delta = sample.delta ?? (sample.expectedScore != null ? sample.aiScore - sample.expectedScore : null)
                const deltaColor =
                  delta == null ? 'text-muted-foreground' : delta === 0 ? 'text-emerald-700' : delta < 0 ? 'text-amber-700' : 'text-blue-700'
                return (
                  <button
                    key={sample.id}
                    className={`grid w-full grid-cols-6 items-center px-4 py-3 text-sm transition ${
                      active ? 'bg-primary/5' : 'bg-white'
                    }`}
                    onClick={() => setSelectedId(sample.id)}
                  >
                    <div className="flex items-center gap-2 text-left">
                      <span className="font-medium text-foreground">{sample.registrationNumber}</span>
                    </div>
                    <span className="text-right text-foreground font-semibold">{sample.aiScore}</span>
                    <span className="text-right text-muted-foreground">
                      <Input
                        className="h-9 w-24 text-right"
                        type="number"
                        value={sample.expectedScore ?? ''}
                        onChange={(event) => handleExpectedChange(sample.id, event.target.value)}
                      />
                    </span>
                    <span className={`text-right text-sm font-semibold ${deltaColor}`}>
                      {delta == null ? '—' : delta > 0 ? `+${delta}` : delta}
                    </span>
                    <span className="text-right text-muted-foreground">
                      {sample.confidenceScore ? `${sample.confidenceScore}%` : '—'}
                    </span>
                    <span className="text-right">
                      <Badge variant="outline" className="border-border bg-muted/40">
                        {sample.status ?? 'pending'}
                      </Badge>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="dashboard-panel space-y-4 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Review sample</h3>
              {selectedSample?.verdict && (
                <Badge
                  className={`border-0 ${selectedSample.verdict === 'yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                >
                  {selectedSample.verdict === 'yes' ? 'Looks correct' : 'Needs correction'}
                </Badge>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={selectedSample?.scanUrl ?? placeholderScan}
                    alt="Scanned answer"
                    className="h-72 w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">OCR text</p>
                  <Textarea
                    readOnly
                    value={selectedSample?.ocrText ?? 'OCR text not available yet.'}
                    className="mt-1 h-32 resize-none bg-muted/40"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-white p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">AI score & reasoning</p>
                    <Badge variant="outline" className="border-border bg-muted/30">
                      {selectedSample?.confidenceScore ? `${selectedSample.confidenceScore}%` : '—'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {selectedSample?.aiScore ?? '—'}{' '}
                    <span className="text-base font-normal text-muted-foreground">/ expected {selectedSample?.expectedScore ?? '—'}</span>
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    {selectedSample?.aiReasoning ?? 'AI reasoning will appear once grading finishes.'}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">Does this look correct?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      variant={selectedSample?.verdict === 'yes' ? 'default' : 'outline'}
                      onClick={() => selectedSample && handleVerdict(selectedSample.id, 'yes')}
                    >
                      <Check className="mr-2 h-4 w-4" /> Yes
                    </Button>
                    <Button
                      className="rounded-xl"
                      variant={selectedSample?.verdict === 'no' ? 'default' : 'outline'}
                      onClick={() => selectedSample && handleVerdict(selectedSample.id, 'no')}
                    >
                      <X className="mr-2 h-4 w-4" /> No
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-panel flex flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Decision</p>
              <Button
                className="w-full rounded-xl bg-primary hover:bg-primary/90"
                disabled={busy || stage === 'approved'}
                onClick={() => void handleApprove()}
              >
                Approve for full grading
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => router.push(`/exams/${examId}`)}
              >
                Refine configuration
              </Button>
              <Button variant="ghost" className="w-full rounded-xl" onClick={() => void handleRerun()}>
                <Undo2 className="mr-2 h-4 w-4" />
                Re-run test
              </Button>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
              <p className="font-semibold text-emerald-900">Tip</p>
              Approve only if at least 80% of samples look correct and no systemic bias is observed.
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
