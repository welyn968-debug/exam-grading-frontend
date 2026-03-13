'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'
import {
  getDepartmentAiHealth,
  getFairnessReport,
  listExams,
  type DepartmentAiHealth,
  type Exam,
  type FairnessReport,
} from '@/lib/api'

const fallbackExams: Exam[] = [
  {
    id: 'dept-analytics-fallback',
    title: 'Calculus I Midterm',
    courseCode: 'MAT101',
    semester: 'Semester 1',
    totalMarks: 100,
    status: 'completed',
    submissionCount: 45,
    gradedCount: 45,
    averageGrade: 76,
  },
]

const fallbackHealth: DepartmentAiHealth = {
  averageConfidence: 86.7,
  overrideRate: 8.2,
  flaggedExams: 2,
  activeModels: ['deepseek-chat'],
  recentAlerts: ['Bias drift detected in PHY202'],
}

const fallbackFairness: FairnessReport = {
  examId: 'dept-analytics-fallback',
  biasScore: 0.12,
  driftScore: 0.18,
  overrideRate: 9.4,
  flaggedPatterns: ['Low confidence on long-form answers'],
}

export default function DepartmentAnalyticsPage() {
  const [exams, setExams] = useState<Exam[]>(fallbackExams)
  const [selectedExamId, setSelectedExamId] = useState<string>(fallbackExams[0].id)
  const [health, setHealth] = useState<DepartmentAiHealth>(fallbackHealth)
  const [fairness, setFairness] = useState<FairnessReport>(fallbackFairness)
  const [message, setMessage] = useState<string | null>(null)
  const [tab, setTab] = useState<'performance' | 'compulsory' | 'misconceptions' | 'leaderboard'>(
    'performance',
  )

  useEffect(() => {
    async function run() {
      try {
        const [examsResponse, healthResponse] = await Promise.all([
          listExams(),
          getDepartmentAiHealth(),
        ])
        const examData = examsResponse.length > 0 ? examsResponse : fallbackExams
        setExams(examData)
        setHealth(healthResponse)
        if (!selectedExamId && examData.length > 0) {
          setSelectedExamId(examData[0].id)
        }
      } catch (err) {
        setExams(fallbackExams)
        setHealth(fallbackHealth)
        setMessage(
          err instanceof Error
            ? `${err.message}. Showing fallback department analytics.`
            : 'Showing fallback department analytics.',
        )
      }
    }
    void run()
  }, [])

  useEffect(() => {
    async function runFairness() {
      if (!selectedExamId) return
      try {
        const response = await getFairnessReport(selectedExamId)
        setFairness(response)
      } catch {
        setFairness({ ...fallbackFairness, examId: selectedExamId })
      }
    }
    void runFairness()
  }, [selectedExamId])

  const healthBars = useMemo(
    () => [
      { key: 'Confidence', value: health.averageConfidence },
      { key: 'Overrides', value: health.overrideRate },
      { key: 'Flagged Exams', value: health.flaggedExams * 10 },
    ],
    [health],
  )

  return (
    <LayoutWrapper role="department_head">
      <div className="space-y-6">
        <SectionHeader
          title="Department Analytics"
          description="AI health, fairness checks, and performance trends"
        />

        {message && (
          <div className="dashboard-panel border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        )}

        <div className="dashboard-panel flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <label className="text-sm font-medium text-foreground">Fairness report exam</label>
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
          <StatCard
            label="Avg Confidence"
            value={`${health.averageConfidence.toFixed(1)}%`}
            color="primary"
          />
          <StatCard
            label="Override Rate"
            value={`${health.overrideRate.toFixed(1)}%`}
            color="secondary"
          />
          <StatCard label="Flagged Exams" value={health.flaggedExams} color="accent" />
          <StatCard
            label="Bias Score"
            value={(fairness.biasScore ?? 0).toFixed(2)}
            color="primary"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="dashboard-panel p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              AI Health Signals
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={healthBars}>
                <CartesianGrid stroke="#dbe4f2" strokeDasharray="3 3" />
                <XAxis dataKey="key" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="value" fill="#1f4ed8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-panel p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Fairness Report
            </h3>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground">Bias Score</p>
                <p className="text-lg font-semibold text-foreground">
                  {(fairness.biasScore ?? 0).toFixed(3)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground">Drift Score</p>
                <p className="text-lg font-semibold text-foreground">
                  {(fairness.driftScore ?? 0).toFixed(3)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground">Override Rate</p>
                <p className="text-lg font-semibold text-foreground">
                  {(fairness.overrideRate ?? 0).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel p-5">
          <h3 className="mb-3 text-base font-semibold text-foreground">Flagged Patterns</h3>
          {fairness.flaggedPatterns && fairness.flaggedPatterns.length > 0 ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {fairness.flaggedPatterns.map((pattern) => (
                <li key={pattern}>{pattern}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No flagged patterns reported.</p>
          )}
        </div>

        <div className="dashboard-panel p-5">
          <div className="flex flex-wrap gap-2">
            {[
              ['performance', 'Per-Question Performance'],
              ['compulsory', 'Compulsory vs Elective'],
              ['misconceptions', 'Common Misconceptions'],
              ['leaderboard', 'Time-Saved Leaderboard'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key as typeof tab)}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  tab === key
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-muted text-foreground hover:bg-muted/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'performance' && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Top performing questions: Q1 (92%), Q2 (88%).</p>
              <p>Lowest performing: Q5 (58%), Q6 (52%).</p>
            </div>
          )}

          {tab === 'compulsory' && (
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="font-semibold text-foreground">Compulsory</p>
                <p>Avg: 78%, Variance: 6.2</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="font-semibold text-foreground">Elective</p>
                <p>Avg: 74%, Variance: 9.1</p>
              </div>
            </div>
          )}

          {tab === 'misconceptions' && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Common misconception: Confusing supply shift vs movement along curve.</p>
              <p>Action: Share exemplar answer + add to few-shot context.</p>
            </div>
          )}

          {tab === 'leaderboard' && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Dr. Mwangi — 18.5 hrs saved</p>
              <p>Dr. Kipkoskei — 16.2 hrs saved</p>
              <p>Dr. Omondi — 15.4 hrs saved</p>
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}
