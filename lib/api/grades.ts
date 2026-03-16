import { request } from './http'
import type { ApiListResponse, Grade } from './types'

type UnknownRecord = Record<string, unknown>

function toArray<T>(payload: ApiListResponse<T> | unknown): T[] {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  const data = payload as UnknownRecord
  const candidates = [data.data, data.items, data.results, data.grades]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[]
  }
  return []
}

function normalizeGrade(payload: unknown): Grade {
  if (!payload || typeof payload !== 'object') {
    return {
      id: 'unknown',
      registrationNumber: 'N/A',
      finalScore: 0,
      confidenceScore: 0,
      needsReview: false,
      status: 'pending',
    }
  }

  const data = payload as UnknownRecord
  const confidence =
    typeof data.confidence_score === 'number'
      ? Math.round(data.confidence_score * 100)   // backend sends 0-1, convert to 0-100
      : typeof data.confidenceScore === 'number'
        ? data.confidenceScore                      // already 0-100 if from frontend state
        : 0

  const needsReview =
    typeof data.needs_review === 'boolean'
      ? data.needs_review
      : typeof data.needsReview === 'boolean'
        ? data.needsReview
        : confidence < 80

  const ocrText =
    typeof data.ocr_text === 'string'
      ? data.ocr_text
      : typeof data.ocrText === 'string'
        ? data.ocrText
        : undefined

  const scanUrl =
    typeof data.scan_url === 'string'
      ? data.scan_url
      : typeof data.scanUrl === 'string'
        ? data.scanUrl
        : typeof data.answerImage === 'string'
          ? data.answerImage
          : undefined

  return {
    id: String(data.id ?? data.grade_id ?? 'unknown'),
    registrationNumber:
      typeof data.registration_number === 'string'
        ? data.registration_number
        : typeof data.registrationNumber === 'string'
          ? data.registrationNumber
          : 'N/A',
    questionNum:
      typeof data.question_num === 'string'
        ? data.question_num
        : typeof data.questionNum === 'string'
          ? data.questionNum
          : undefined,
    questionType:
      typeof data.question_type === 'string'
        ? data.question_type
        : typeof data.questionType === 'string'
          ? data.questionType
          : undefined,
    aiScore:
      typeof data.ai_score === 'number'
        ? data.ai_score
        : typeof data.aiScore === 'number'
          ? data.aiScore
          : undefined,
    finalScore:
      typeof data.final_score === 'number'
        ? data.final_score
        : typeof data.finalScore === 'number'
          ? data.finalScore
          : 0,
    confidenceScore: confidence,
    needsReview,
    aiReasoning:
      typeof data.ai_reasoning === 'string'
        ? data.ai_reasoning
        : typeof data.aiReasoning === 'string'
          ? data.aiReasoning
          : undefined,
    ocrText,
    scanUrl,
    status:
      typeof data.status === 'string'
        ? data.status
        : needsReview
          ? 'pending'
          : 'reviewed',
    studentName:
      typeof data.student_name === 'string'
        ? data.student_name
        : typeof data.studentName === 'string'
          ? data.studentName
          : undefined,
  }
}

export async function listExamGrades(
    examId: string | null,
    options: { needsReview?: boolean; confidenceGt?: number } = {},
): Promise<Grade[]> {
  const params = new URLSearchParams()
  if (typeof options.needsReview === 'boolean') {
    params.set('needs_review', String(options.needsReview))
  }
  if (typeof options.confidenceGt === 'number') {
    params.set('confidence_gt', String(options.confidenceGt))
  }
  const suffix = params.toString()
  const path = `/exams/${examId}/grades${suffix ? `?${suffix}` : ''}`
  const response = await request<ApiListResponse<unknown>>(path)
  return toArray(response).map(normalizeGrade)
}

export async function getGrade(gradeId: string): Promise<Grade> {
  const response = await request<unknown>(`/grades/${gradeId}`)
  if (response && typeof response === 'object' && 'data' in response) {
    return normalizeGrade((response as { data?: unknown }).data)
  }
  return normalizeGrade(response)
}

export async function updateGrade(
  gradeId: string,
  payload: Record<string, unknown>,
): Promise<Grade> {
  // Backend expects {action: 'approve'} or {action: 'override', final_score, override_reason}
  const body: Record<string, unknown> = {}
  if (payload.override_reason || (payload.final_score !== undefined && payload.action !== 'approve')) {
    body.action = 'override'
    body.final_score = payload.final_score
    if (payload.override_reason) body.override_reason = payload.override_reason
  } else {
    body.action = payload.action ?? 'approve'
    if (payload.final_score !== undefined) body.final_score = payload.final_score
  }

  const response = await request<unknown>(`/grades/${gradeId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return normalizeGrade(response)
}

export async function bulkApproveGrades(
  examId: string,
  payload: Record<string, unknown> = {},
): Promise<{ success: boolean }> {
  await request(`/exams/${examId}/grades/bulk-approve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return { success: true }
}
