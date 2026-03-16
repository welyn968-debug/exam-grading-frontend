'use client'

import { useEffect, useState } from 'react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { getAiHealthOverrides, getDepartmentAiHealth, type AiOverride, type DepartmentAiHealth } from '@/lib/api'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

const fallbackHealth: DepartmentAiHealth = {
  averageConfidence: 86.2,
  overrideRate: 8.4,
  flaggedExams: 2,
  activeModels: ['deepseek-chat'],
  recentAlerts: ['High overrides on MAT201 Q4'],
}

const fallbackOverrides: AiOverride[] = [
  {
    gradeId: 'grade-1',
    examId: 'ex-12',
    questionNum: 'Q4',
    lecturer: 'Dr. Kipkemei',
    reason: 'LLM missed units; corrected to 7/10',
    createdAt: '2026-02-25',
  },
  {
    gradeId: 'grade-2',
    examId: 'ex-15',
    questionNum: 'Q2',
    lecturer: 'Dr. Mwangi',
    reason: 'OCR misread denominator; adjusted score',
    createdAt: '2026-02-24',
  },
]

export default function AiHealthPage() {
  const [health, setHealth] = useState<DepartmentAiHealth>(fallbackHealth)
  const [overrides, setOverrides] = useState<AiOverride[]>(fallbackOverrides)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      try {
        const [healthResponse, overridesResponse] = await Promise.all([
          getDepartmentAiHealth(),
          getAiHealthOverrides(),
        ])
        setHealth(healthResponse)
        setOverrides(overridesResponse.length > 0 ? overridesResponse : fallbackOverrides)
      } catch (err) {
        setHealth(fallbackHealth)
        setOverrides(fallbackOverrides)
        setMessage(err instanceof Error ? err.message : 'Fallback AI health data in use.')
      }
    }
    void run()
  }, [])

  return (
    <LayoutWrapper role="department_head">
      <div className="space-y-6">
        <SectionHeader
          title="AI Health & Compliance"
          description="Bias, overrides, and operational safeguards for your department"
        />

        {message && (
          <div className="dashboard-panel border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Avg Confidence" value={`${health.averageConfidence.toFixed(1)}%`} color="primary" />
          <StatCard label="Override Rate" value={`${health.overrideRate.toFixed(1)}%`} color="secondary" />
          <StatCard label="Flagged Exams" value={health.flaggedExams} color="accent" />
          <StatCard label="Active Models" value={health.activeModels?.length ?? 0} color="primary" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="dashboard-panel p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Recent Overrides (few-shot candidates)
              </h3>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              {overrides.map((item) => (
                <div
                  key={item.gradeId}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{item.gradeId}</p>
                    <Badge className="border-0 bg-primary/10 text-primary">
                      {item.questionNum ?? 'Q?'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {item.reason ?? 'No reason provided.'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.lecturer ?? 'Unknown lecturer'} • {item.createdAt ?? 'recent'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-panel p-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Compliance & Retention
              </h3>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <p>DPIA status: <strong>Completed</strong> (Jan 2026)</p>
              <p>Data retention: <strong>90 days</strong> for uploads, 365 days for grades.</p>
              <p>Audit log: <strong>Enabled</strong> for all overrides and exports.</p>
              <p>Export control: Only department heads can export full gradebooks.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-panel p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Alerts
          </h3>
          {health.recentAlerts && health.recentAlerts.length > 0 ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {health.recentAlerts.map((alert) => (
                <li key={alert} className="flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                    Alert
                  </Badge>
                  {alert}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No active alerts.</p>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}
