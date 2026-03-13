import { request } from './http'
import type { ApiListResponse, SampleTestResult, TestingRun, TestingStage } from './types'

type UnknownRecord = Record<string, unknown>

function toArray<T>(payload: ApiListResponse<T> | unknown): T[] {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  const data = payload as UnknownRecord
  const candidates = [data.data, data.items, data.results, data.samples]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[]
  }
  return []
}

function normalizeStage(stage: unknown): TestingStage {
  if (typeof stage !== 'string') return 'idle'
  return stage as TestingStage
}

function normalizeRun(payload: unknown): TestingRun {
  if (!payload || typeof payload !== 'object') {
    return {
      id: 'fallback',
      examId: 'unknown',
      stage: 'idle',
      totalSamples: 10,
      ocrCompleted: 0,
      gradingCompleted: 0,
    }
  }

  const data = payload as UnknownRecord
  return {
    id: String(data.id ?? data.run_id ?? 'fallback'),
    examId: String(data.exam_id ?? data.examId ?? 'unknown'),
    stage: normalizeStage(data.stage ?? data.status),
    status: typeof data.status === 'string' ? data.status : undefined,
    totalSamples:
      typeof data.total_samples === 'number'
        ? data.total_samples
        : typeof data.totalSamples === 'number'
          ? data.totalSamples
          : 0,
    processed:
      typeof data.processed === 'number'
        ? data.processed
        : typeof data.completed === 'number'
          ? data.completed
          : undefined,
    ocrCompleted:
      typeof data.ocr_completed === 'number'
        ? data.ocr_completed
        : typeof data.ocrCompleted === 'number'
          ? data.ocrCompleted
          : undefined,
    gradingCompleted:
      typeof data.grading_completed === 'number'
        ? data.grading_completed
        : typeof data.gradingCompleted === 'number'
          ? data.gradingCompleted
          : undefined,
    createdAt:
      typeof data.created_at === 'string'
        ? data.created_at
        : typeof data.createdAt === 'string'
          ? data.createdAt
          : undefined,
    updatedAt:
      typeof data.updated_at === 'string'
        ? data.updated_at
        : typeof data.updatedAt === 'string'
          ? data.updatedAt
          : undefined,
    message: typeof data.message === 'string' ? data.message : undefined,
  }
}

function normalizeSample(payload: unknown): SampleTestResult {
  if (!payload || typeof payload !== 'object') {
    return {
      id: 'sample',
      registrationNumber: '2021-BIT-001',
      aiScore: 15,
      expectedScore: 15,
      delta: 0,
      confidenceScore: 82,
      status: 'pending',
    }
  }

  const data = payload as UnknownRecord
  const aiScore =
    typeof data.ai_score === 'number'
      ? data.ai_score
      : typeof data.aiScore === 'number'
        ? data.aiScore
        : 0
  const expected =
    typeof data.expected_score === 'number'
      ? data.expected_score
      : typeof data.expectedScore === 'number'
        ? data.expectedScore
        : undefined

  return {
    id: String(data.id ?? data.sample_id ?? 'sample'),
    examId: typeof data.exam_id === 'string' ? data.exam_id : undefined,
    runId: typeof data.run_id === 'string' ? data.run_id : undefined,
    registrationNumber:
      typeof data.registration_number === 'string'
        ? data.registration_number
        : typeof data.student_id === 'string'
          ? data.student_id
          : 'unknown',
    aiScore,
    expectedScore: expected,
    delta: typeof data.delta === 'number' ? data.delta : expected !== undefined ? aiScore - expected : undefined,
    confidenceScore:
      typeof data.confidence_score === 'number'
        ? data.confidence_score
        : typeof data.confidence === 'number'
          ? data.confidence
          : undefined,
    status: typeof data.status === 'string' ? data.status : 'pending',
    aiReasoning:
      typeof data.ai_reasoning === 'string'
        ? data.ai_reasoning
        : typeof data.reasoning === 'string'
          ? data.reasoning
          : undefined,
    ocrText:
      typeof data.ocr_text === 'string'
        ? data.ocr_text
        : typeof data.ocrText === 'string'
          ? data.ocrText
          : undefined,
    scanUrl:
      typeof data.scan_url === 'string'
        ? data.scan_url
        : typeof data.image_url === 'string'
          ? data.image_url
          : undefined,
    verdict:
      data.verdict === 'yes' || data.verdict === 'no'
        ? data.verdict
        : (data as { verdict?: unknown }).verdict === true
          ? 'yes'
          : undefined,
  }
}

export async function startTestingRun(examId: string, file: File): Promise<TestingRun> {
  const payload = new FormData()
  payload.append('file', file)
  const response = await request<unknown>(`/exams/${examId}/testing/start`, {
    method: 'POST',
    body: payload,
  })
  return normalizeRun(response)
}

export async function getLatestTestingRun(examId: string): Promise<TestingRun | null> {
  const response = await request<unknown>(`/exams/${examId}/testing/latest`)
  if (!response) return null
  return normalizeRun(response)
}

export async function listSampleResults(examId: string, runId: string): Promise<SampleTestResult[]> {
  const response = await request<ApiListResponse<unknown>>(`/exams/${examId}/testing/${runId}/samples`)
  return toArray(response).map(normalizeSample)
}

export async function approveTestingRun(examId: string, runId: string): Promise<{ success: boolean }> {
  await request(`/exams/${examId}/testing/${runId}/approve`, { method: 'POST' })
  return { success: true }
}

export async function rerunTesting(examId: string, runId?: string): Promise<TestingRun> {
  const endpoint = runId
    ? `/exams/${examId}/testing/${runId}/rerun`
    : `/exams/${examId}/testing/rerun`
  const response = await request<unknown>(endpoint, { method: 'POST' })
  return normalizeRun(response)
}
