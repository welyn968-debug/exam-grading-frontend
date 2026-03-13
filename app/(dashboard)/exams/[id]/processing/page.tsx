'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Loader2, Radio } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/useRealtime'

type Stage = 'upload' | 'ocr' | 'grading' | 'complete'

const sampleFeed = [
  { reg: '2021-BIT-045', status: 'OCR complete (92%)' },
  { reg: '2021-BIT-046', status: 'OCR complete (90%)' },
  { reg: '2021-BIT-047', status: 'Grading in progress' },
]

type PageProps = {
  params: { id: string }
}

export default function ProcessingPage({ params }: PageProps) {
  const [stage, setStage] = useState<Stage>('upload')
  const [completed, setCompleted] = useState(12)
  const [total, setTotal] = useState(124)
  const [feed, setFeed] = useState(sampleFeed)

  const percent = useMemo(
    () => (total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0),
    [completed, total],
  )

  useRealtime(
    {
      ocr_progress: (payload) => {
        if (!payload || typeof payload !== 'object') return
        const data = payload as { completed?: number; total?: number; current_reg?: string }
        if (typeof data.completed === 'number') setCompleted(data.completed)
        if (typeof data.total === 'number') setTotal(data.total)
        if (data.current_reg) {
          setFeed((prev) => [{ reg: data.current_reg, status: 'OCR complete' }, ...prev].slice(0, 6))
        }
        setStage('ocr')
      },
      grading_progress: (payload) => {
        if (payload && typeof payload === 'object' && 'completed' in payload) {
          const data = payload as { completed?: number; total?: number }
          if (typeof data.completed === 'number') setCompleted(data.completed)
          if (typeof data.total === 'number') setTotal(data.total)
        }
        setStage('grading')
      },
      review_ready: () => setStage('complete'),
    },
    { enabled: true },
  )

  useEffect(() => {
    // simulate progress on first load
    const timer = setInterval(() => {
      setCompleted((c) => Math.min(total, c + 1))
    }, 1200)
    return () => clearInterval(timer)
  }, [total])

  const stages: Array<{ key: Stage; label: string }> = [
    { key: 'upload', label: 'Upload' },
    { key: 'ocr', label: 'OCR' },
    { key: 'grading', label: 'Grading' },
    { key: 'complete', label: 'Review Ready' },
  ]

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="dashboard-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Exam ID: {params.id}</p>
              <h1 className="text-2xl font-semibold text-foreground">Processing Dashboard</h1>
            </div>
            <Badge className="border-0 bg-emerald-100 text-emerald-700">
              Live
            </Badge>
          </div>
        </div>

        <div className="dashboard-panel grid gap-6 p-6 md:grid-cols-5">
          <div className="md:col-span-2 flex flex-col items-center justify-center gap-4">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-muted/50">
              <svg className="absolute inset-0 h-full w-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  stroke="#008751"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${percent * 2.64} 999`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{percent}%</p>
                <p className="text-xs text-muted-foreground">
                  {completed} of {total} students
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Estimated time left: ~7 minutes</p>
            <Button variant="outline" className="rounded-xl">
              Cancel processing
            </Button>
          </div>

          <div className="md:col-span-3 space-y-4">
            <div className="flex flex-wrap gap-2">
              {stages.map((item) => {
                const active = stage === item.key
                const done = stages.findIndex((s) => s.key === stage) > stages.findIndex((s) => s.key === item.key)
                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : done
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : active ? (
                      <Radio className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Loader2 className="h-4 w-4" />
                    )}
                    {item.label}
                  </div>
                )
              })}
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Live Feed</p>
                <Badge variant="outline" className="border-border">
                  WebSocket: connected
                </Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {feed.map((item) => (
                  <div
                    key={`${item.reg}-${item.status}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2"
                  >
                    <span className="font-medium text-foreground">{item.reg}</span>
                    <span className="text-muted-foreground">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
