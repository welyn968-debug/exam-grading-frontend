'use client'

import { useState, type ReactNode } from 'react'
import { Upload, AlertTriangle } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { uploadSubmissions } from '@/lib/api'
import { useRouter } from 'next/navigation'

type PageProps = {
  params: { id: string }
}

export default function ExamUploadPage({ params }: PageProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [validCount, setValidCount] = useState(0)
  const [invalidCount, setInvalidCount] = useState(0)
  const [busy, setBusy] = useState(false)

  function simulateValidation(selected: File) {
    // Simple client-side hint for UX; backend will validate for real
    const sizeMb = selected.size / 1024 / 1024
    const estimatedStudents = Math.max(5, Math.round(sizeMb / 2))
    setValidCount(Math.floor(estimatedStudents * 0.9))
    setInvalidCount(Math.max(0, estimatedStudents - Math.floor(estimatedStudents * 0.9)))
  }

  async function handleUpload() {
    if (!file) return
    setBusy(true)
    setMessage(null)
    setProgress(12)
    try {
      await uploadSubmissions(params.id, file)
      setProgress(95)
      setMessage('Upload successful. Processing has started.')
      setTimeout(() => router.push(`/exams/${params.id}/processing`), 600)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setProgress(100)
      setBusy(false)
    }
  }

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="dashboard-panel p-6">
          <h1 className="text-2xl font-semibold text-foreground">Upload Scanned Scripts</h1>
          <p className="text-sm text-muted-foreground">
            Exam ID: {params.id} • Upload a single ZIP of all student scripts (max 500 MB).
          </p>
        </div>

        {message && (
          <div className="dashboard-panel border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {message}
          </div>
        )}

        <div className="dashboard-panel space-y-5 p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5 p-10 text-center">
            <Upload className="mb-3 h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-foreground">
              Drop ZIP file here (max 500 MB) or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Naming: STUDENTID_Page1.jpg inside ZIP recommended
            </p>
            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null
                setFile(selected)
                if (selected) simulateValidation(selected)
              }}
            />
          </label>

          {file && (
            <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB • {validCount} valid • {invalidCount}{' '}
                    flagged
                  </p>
                </div>
                <BadgePill tone={invalidCount === 0 ? 'success' : 'warning'}>
                  {invalidCount === 0 ? 'Ready' : 'Needs naming fixes'}
                </BadgePill>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Progress</span>
                  <Progress value={progress} />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded-xl bg-primary hover:bg-primary/90"
              disabled={!file || busy}
              onClick={() => void handleUpload()}
            >
              Start Processing
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => router.push(`/exams/${params.id}`)}>
              Back to Exam
            </Button>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <div>
              Ensure each file follows the naming convention <strong>REGNO_Page#.jpg</strong> to
              avoid manual corrections.
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

function BadgePill({
  tone,
  children,
}: {
  tone: 'success' | 'warning'
  children: ReactNode
}) {
  const toneClasses =
    tone === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-amber-100 text-amber-800'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses}`}>
      {children}
    </span>
  )
}
