import { request } from './http'
import type { AiOverride, DepartmentAiHealth } from './types'

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

export async function getDepartmentAiHealth(): Promise<DepartmentAiHealth> {
  const response = await request<unknown>('/department/ai-health')
  if (!response || typeof response !== 'object') {
    return {
      averageConfidence: 0,
      overrideRate: 0,
      flaggedExams: 0,
      activeModels: [],
      recentAlerts: [],
    }
  }

  const data = response as Record<string, unknown>
  return {
    averageConfidence: toNumber(
      data.average_confidence ?? data.averageConfidence,
    ),
    overrideRate: toNumber(data.override_rate ?? data.overrideRate),
    flaggedExams: toNumber(data.flagged_exams ?? data.flaggedExams),
    activeModels: Array.isArray(data.active_models)
      ? (data.active_models as string[])
      : Array.isArray(data.activeModels)
        ? (data.activeModels as string[])
        : [],
    recentAlerts: Array.isArray(data.recent_alerts)
      ? (data.recent_alerts as string[])
      : Array.isArray(data.recentAlerts)
        ? (data.recentAlerts as string[])
        : [],
  }
}

export async function getAiHealthOverrides(): Promise<AiOverride[]> {
  const response = await request<unknown>('/ai-health/overrides')
  if (!response || typeof response !== 'object') return []
  const data = response as Record<string, unknown>
  const list =
    Array.isArray(data.items) || Array.isArray(data.data) ? (data.items ?? data.data) : response

  if (!Array.isArray(list)) return []
  return list.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>
    return {
      gradeId: String(row.grade_id ?? row.id ?? 'override'),
      examId: typeof row.exam_id === 'string' ? row.exam_id : undefined,
      questionNum: typeof row.question_num === 'string' ? row.question_num : undefined,
      lecturer: typeof row.lecturer === 'string' ? row.lecturer : undefined,
      reason: typeof row.reason === 'string' ? row.reason : undefined,
      createdAt: typeof row.created_at === 'string' ? row.created_at : undefined,
    }
  })
}
