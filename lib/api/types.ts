export type UserRole = 'lecturer' | 'admin' | 'ta' | 'department_head' | string

export type ExamStatus =
  | 'draft'
  | 'ready'
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'archived'
  | string

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  name: string
  email?: string
  role: UserRole
  institution?: string
}

export interface ApiError {
  error: string
  message: string
  details?: unknown
  code?: string
  status?: number
}

export interface Exam {
  id: string
  title: string
  courseCode: string
  semester: string
  totalMarks: number
  status: ExamStatus
  submissionCount: number
  createdAt?: string
  updatedAt?: string
  lecturer?: string
  students?: number
  gradedCount?: number
  averageGrade?: number
}

export interface Submission {
  id: string
  registrationNumber: string
  status: string
  confidenceScore?: number
  submittedAt?: string
  ocrText?: string
}

export interface Grade {
  id: string
  registrationNumber: string
  questionNum?: string
  questionType?: 'compulsory' | 'elective' | string
  aiScore?: number
  finalScore: number
  confidenceScore: number
  needsReview: boolean
  aiReasoning?: string
  ocrText?: string
  scanUrl?: string
  status?: 'pending' | 'reviewed' | 'flagged' | string
  studentName?: string
}

export interface ExamAnalytics {
  examId: string
  averageScore: number
  passRate: number
  excellenceRate?: number
  atRiskRate?: number
  gradeDistribution: Array<{ label: string; count: number }>
  questionPerformance: Array<{ question: string; score: number }>
  trend: Array<{ label: string; average: number }>
}

export interface FairnessReport {
  examId: string
  biasScore?: number
  driftScore?: number
  overrideRate?: number
  flaggedPatterns?: string[]
}

export interface DepartmentAiHealth {
  averageConfidence: number
  overrideRate: number
  flaggedExams: number
  activeModels?: string[]
  recentAlerts?: string[]
}

export interface AiOverride {
  gradeId: string
  examId?: string
  questionNum?: string
  lecturer?: string
  reason?: string
  createdAt?: string
}

export type OcrProgressEvent = {
  exam_id?: string
  completed?: number
  total?: number
  current_reg?: string
}

export type GradingProgressEvent = {
  exam_id?: string
  completed?: number
  total?: number
}

export type TestingStage = 'idle' | 'uploading' | 'ocr' | 'grading' | 'review' | 'approved' | string

export interface TestingRun {
  id: string
  examId: string
  stage: TestingStage
  status?: string
  totalSamples: number
  processed?: number
  ocrCompleted?: number
  gradingCompleted?: number
  createdAt?: string
  updatedAt?: string
  message?: string
}

export interface SampleTestResult {
  id: string
  examId?: string
  runId?: string
  registrationNumber: string
  aiScore: number
  expectedScore?: number
  delta?: number
  confidenceScore?: number
  status?: 'pending' | 'reviewed' | 'approved' | 'flagged' | string
  aiReasoning?: string
  ocrText?: string
  scanUrl?: string
  verdict?: 'yes' | 'no' | null
}

export type ApiListResponse<T> =
  | T[]
  | {
      data?: T[]
      items?: T[]
      results?: T[]
      exams?: T[]
      grades?: T[]
    }
