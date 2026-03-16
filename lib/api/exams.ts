import { request } from './http'
import type { ApiListResponse, Exam, ExamStatus } from './types'

type UnknownRecord = Record<string, unknown>

function toArray<T>(payload: ApiListResponse<T> | unknown): T[] {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  const data = payload as UnknownRecord
  const candidates = [data.data, data.items, data.results, data.exams]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[]
  }
  return []
}

function normalizeStatus(status: unknown): ExamStatus {
  if (typeof status !== 'string') return 'pending'
  return status
}

function normalizeExam(payload: unknown): Exam {
  if (!payload || typeof payload !== 'object') {
    return {
      id: 'unknown',
      title: 'Untitled Exam',
      courseCode: 'N/A',
      semester: 'Current',
      totalMarks: 100,
      status: 'pending',
      submissionCount: 0,
    }
  }

  const data = payload as UnknownRecord
  const titleCandidate = data.title ?? data.name ?? data.course_name ?? data.course_code

  return {
    id: String(data.id ?? data.exam_id ?? 'unknown'),
    title: typeof titleCandidate === 'string' ? titleCandidate : 'Untitled Exam',
    courseCode:
      typeof data.course_code === 'string'
        ? data.course_code
        : typeof data.courseCode === 'string'
          ? data.courseCode
          : 'N/A',
    semester:
      typeof data.semester === 'string'
        ? data.semester
        : typeof data.term === 'string'
          ? data.term
          : 'Current',
    totalMarks:
      typeof data.total_marks === 'number'
        ? data.total_marks
        : typeof data.totalMarks === 'number'
          ? data.totalMarks
          : 100,
    status: normalizeStatus(data.status),
    submissionCount:
      typeof data.submission_count === 'number'
        ? data.submission_count
        : typeof data.submissionCount === 'number'
          ? data.submissionCount
          : 0,
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
    lecturer:
      typeof data.lecturer === 'string'
        ? data.lecturer
        : typeof data.lecturer_name === 'string'
          ? data.lecturer_name
          : undefined,
    students:
      typeof data.students === 'number'
        ? data.students
        : typeof data.submission_count === 'number'
          ? data.submission_count
          : undefined,
    gradedCount:
      typeof data.graded_count === 'number'
        ? data.graded_count
        : typeof data.gradedCount === 'number'
          ? data.gradedCount
          : undefined,
    averageGrade:
      typeof data.average_grade === 'number'
        ? data.average_grade
        : typeof data.averageGrade === 'number'
          ? data.averageGrade
          : undefined,
  }
}

export async function listExams(): Promise<Exam[]> {
  const response = await request<ApiListResponse<unknown>>('/exams')
  return toArray(response).map(normalizeExam)
}

export async function getExam(examId: string): Promise<Exam> {
  const response = await request<unknown>(`/exams/${examId}`)
  if (response && typeof response === 'object' && 'data' in response) {
    return normalizeExam((response as { data?: unknown }).data)
  }
  return normalizeExam(response)
}

export async function createExam(payload: FormData): Promise<Exam> {
  const response = await request<unknown>('/exams', {
    method: 'POST',
    body: payload,
  })
  return normalizeExam(response)
}

export async function updateExam(
  examId: string,
  payload: Record<string, unknown>,
): Promise<Exam> {
  const response = await request<unknown>(`/exams/${examId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return normalizeExam(response)
}

export async function uploadSubmissions(
  examId: string,
  file: File,
): Promise<{ success: boolean }> {
  const payload = new FormData()
  payload.append('file', file)
  await request(`/exams/${examId}/submissions/upload`, {
    method: 'POST',
    body: payload,
  })
  return { success: true }
}
