import { request } from './http'
import type { ExamAnalytics, FairnessReport } from './types'

type UnknownRecord = Record<string, unknown>

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

function normalizeAnalytics(examId: string, payload: unknown): ExamAnalytics {
  if (!payload || typeof payload !== 'object') {
    return {
      examId,
      averageScore: 0,
      passRate: 0,
      gradeDistribution: [],
      questionPerformance: [],
      trend: [],
    }
  }

  const data = payload as UnknownRecord

  const gradeDistributionRaw =
    (Array.isArray(data.grade_distribution)
      ? data.grade_distribution
      : Array.isArray(data.gradeDistribution)
        ? data.gradeDistribution
        : []) as unknown[]

  const questionPerformanceRaw =
    (Array.isArray(data.question_performance)
      ? data.question_performance
      : Array.isArray(data.questionPerformance)
        ? data.questionPerformance
        : []) as unknown[]

  const trendRaw = (Array.isArray(data.trend) ? data.trend : []) as unknown[]

  return {
    examId,
    averageScore: toNumber(data.average_score ?? data.averageScore),
    passRate: toNumber(data.pass_rate ?? data.passRate),
    excellenceRate: toNumber(data.excellence_rate ?? data.excellenceRate),
    atRiskRate: toNumber(data.at_risk_rate ?? data.atRiskRate),
    gradeDistribution: gradeDistributionRaw.map((item) => {
      const row = (item ?? {}) as UnknownRecord
      return {
        label:
          typeof row.label === 'string'
            ? row.label
            : typeof row.range === 'string'
              ? row.range
              : 'N/A',
        count: toNumber(row.count),
      }
    }),
    questionPerformance: questionPerformanceRaw.map((item) => {
      const row = (item ?? {}) as UnknownRecord
      return {
        question:
          typeof row.question === 'string'
            ? row.question
            : typeof row.label === 'string'
              ? row.label
              : 'Q',
        score: toNumber(row.score ?? row.performance ?? row.average),
      }
    }),
    trend: trendRaw.map((item) => {
      const row = (item ?? {}) as UnknownRecord
      return {
        label:
          typeof row.label === 'string'
            ? row.label
            : typeof row.month === 'string'
              ? row.month
              : 'N/A',
        average: toNumber(row.average ?? row.score ?? row.avg),
      }
    }),
  }
}

export async function getExamAnalytics(examId: string): Promise<ExamAnalytics> {
  const response = await request<unknown>(`/exams/${examId}/analytics`)
  if (response && typeof response === 'object' && 'data' in response) {
    return normalizeAnalytics(examId, (response as { data?: unknown }).data)
  }
  return normalizeAnalytics(examId, response)
}

export async function exportExamReport(
  examId: string,
  format: 'csv' | 'pdf',
): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v2'}/exams/${examId}/export?format=${format}`,
    {
      headers: {
        Authorization:
          typeof window !== 'undefined'
            ? `Bearer ${localStorage.getItem('examgrader.access_token') ?? ''}`
            : '',
      },
    },
  )
  if (!response.ok) {
    throw new Error('Failed to export report')
  }
  return response.blob()
}

function normalizeFairness(examId: string, payload: unknown): FairnessReport {
  if (!payload || typeof payload !== 'object') {
    return { examId, flaggedPatterns: [] }
  }

  const data = payload as UnknownRecord
  return {
    examId,
    biasScore: toNumber(data.bias_score ?? data.biasScore),
    driftScore: toNumber(data.drift_score ?? data.driftScore),
    overrideRate: toNumber(data.override_rate ?? data.overrideRate),
    flaggedPatterns: Array.isArray(data.flagged_patterns)
      ? (data.flagged_patterns as string[])
      : Array.isArray(data.flaggedPatterns)
        ? (data.flaggedPatterns as string[])
        : [],
  }
}

export async function getFairnessReport(examId: string): Promise<FairnessReport> {
  const response = await request<unknown>(`/exams/${examId}/fairness-report`)
  if (response && typeof response === 'object' && 'data' in response) {
    return normalizeFairness(examId, (response as { data?: unknown }).data)
  }
  return normalizeFairness(examId, response)
}
