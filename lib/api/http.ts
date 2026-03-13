import { API_BASE_URL } from './config'
import {
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  setSessionTokens,
} from './session'
import type { ApiError, AuthTokens } from './types'

type RequestOptions = {
  skipAuth?: boolean
  retryOn401?: boolean
}

type AuthFailureHandler = () => void

let authFailureHandler: AuthFailureHandler | null = null
let refreshPromise: Promise<string | null> | null = null

export class ApiRequestError extends Error {
  status: number
  code?: string
  details?: unknown
  payload?: unknown

  constructor(message: string, error: ApiError) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = error.status ?? 500
    this.code = error.code
    this.details = error.details
    this.payload = error
  }
}

function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function parseTokens(payload: Record<string, unknown>): AuthTokens | null {
  const access = payload.access_token ?? payload.accessToken
  const refresh = payload.refresh_token ?? payload.refreshToken
  if (typeof access !== 'string' || typeof refresh !== 'string') return null
  return { accessToken: access, refreshToken: refresh }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function normalizeError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object') {
    const candidate = body as Record<string, unknown>
    return {
      error: typeof candidate.error === 'string' ? candidate.error : 'ApiError',
      message:
        typeof candidate.message === 'string'
          ? candidate.message
          : `Request failed with status ${status}`,
      details: candidate.details,
      code: typeof candidate.code === 'string' ? candidate.code : undefined,
      status,
    }
  }
  return {
    error: 'ApiError',
    message: `Request failed with status ${status}`,
    status,
    details: body,
  }
}

function buildHeaders(
  init: RequestInit,
  options: RequestOptions,
  token: string | null,
): Headers {
  const headers = new Headers(init.headers)
  const hasBody = init.body !== undefined && init.body !== null
  const isFormData =
    typeof FormData !== 'undefined' && hasBody && init.body instanceof FormData
  if (!isFormData && hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (!options.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null

    const response = await fetch(toAbsoluteUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const body = await parseBody(response)
    if (!response.ok || !body || typeof body !== 'object') {
      clearSessionTokens()
      authFailureHandler?.()
      return null
    }

    const tokens = parseTokens(body as Record<string, unknown>)
    if (!tokens) {
      clearSessionTokens()
      authFailureHandler?.()
      return null
    }

    setSessionTokens(tokens)
    return tokens.accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

export function registerAuthFailureHandler(handler: AuthFailureHandler | null) {
  authFailureHandler = handler
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  const token = getAccessToken()
  const headers = buildHeaders(init, options, token)
  const response = await fetch(toAbsoluteUrl(path), {
    ...init,
    headers,
  })

  const body = await parseBody(response)

  if (response.ok) {
    return body as T
  }

  if (
    response.status === 401 &&
    !options.skipAuth &&
    options.retryOn401 !== false
  ) {
    const nextToken = await refreshAccessToken()
    if (nextToken) {
      return request<T>(path, init, { ...options, retryOn401: false })
    }
    const authError = normalizeError(response.status, body)
    throw new ApiRequestError(authError.message, authError)
  }

  const error = normalizeError(response.status, body)
  throw new ApiRequestError(error.message, error)
}

export async function requestWithoutAuth<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return request<T>(path, init, { skipAuth: true, retryOn401: false })
}
