import {
  clearSessionTokens,
  clearStoredUser,
  setSessionTokens,
  setStoredUser,
} from './session'
import { request, requestWithoutAuth } from './http'
import type { AuthTokens, AuthUser } from './types'

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  email: string
  password: string
  name?: string
}

function mapUser(payload: unknown): AuthUser {
  if (!payload || typeof payload !== 'object') {
    return {
      id: 'unknown',
      name: 'Lecturer',
      role: 'lecturer',
    }
  }

  const data = payload as Record<string, unknown>
  const nameCandidate = data.name ?? data.full_name ?? data.username
  return {
    id: String(data.id ?? data.user_id ?? 'unknown'),
    name: typeof nameCandidate === 'string' ? nameCandidate : 'Lecturer',
    email: typeof data.email === 'string' ? data.email : undefined,
    role: typeof data.role === 'string' ? data.role : 'lecturer',
    institution:
      typeof data.institution === 'string' ? data.institution : undefined,
  }
}

function mapTokens(payload: Record<string, unknown>): AuthTokens {
  const access = payload.access_token ?? payload.accessToken
  const refresh = payload.refresh_token ?? payload.refreshToken

  if (typeof access !== 'string' || typeof refresh !== 'string') {
    throw new Error('Invalid auth token payload')
  }

  return {
    accessToken: access,
    refreshToken: refresh,
  }
}

type LoginResponse = {
  access_token?: string
  refresh_token?: string
  accessToken?: string
  refreshToken?: string
  user?: unknown
}

export async function login(payload: LoginPayload): Promise<{
  user: AuthUser
  tokens: AuthTokens
}> {
  const response = await requestWithoutAuth<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const tokens = mapTokens(response as Record<string, unknown>)
  const user = mapUser((response as LoginResponse).user)

  setSessionTokens(tokens)
  setStoredUser(user)

  return { user, tokens }
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const response = await requestWithoutAuth<{ user?: unknown }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const user = mapUser(response.user)
  setStoredUser(user)
  return user
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await request<{ user?: unknown } | unknown>('/auth/me')
  if (response && typeof response === 'object' && 'user' in response) {
    return mapUser((response as { user?: unknown }).user)
  }
  return mapUser(response)
}

export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  const response = await requestWithoutAuth<Record<string, unknown>>(
    '/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  )
  const tokens = mapTokens(response)
  setSessionTokens(tokens)
  return tokens
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    clearSessionTokens()
    clearStoredUser()
  }
}

export async function requestPasswordReset(payload: {
  email: string
}): Promise<{ success: boolean; message: string }> {
  try {
    await requestWithoutAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return {
      success: true,
      message: 'Reset instructions sent if the account exists.',
    }
  } catch {
    return {
      success: true,
      message: 'Reset instructions sent if the account exists.',
    }
  }
}

export async function updatePassword(payload: {
  token?: string
  password: string
}): Promise<{ success: boolean }> {
  try {
    await requestWithoutAuth('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}
