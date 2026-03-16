import type { AuthTokens } from './types'

export const ACCESS_TOKEN_KEY = 'examgrader.access_token'
export const REFRESH_TOKEN_KEY = 'examgrader.refresh_token'
export const USER_KEY = 'examgrader.user'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setSessionTokens(tokens: AuthTokens): void {
  if (!isBrowser()) return
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearSessionTokens(): void {
  if (!isBrowser()) return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function setStoredUser(user: unknown): void {
  if (!isBrowser()) return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser<T>(): T | null {
  if (!isBrowser()) return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearStoredUser(): void {
  if (!isBrowser()) return
  localStorage.removeItem(USER_KEY)
}

type TokenProvider = () => Promise<string | null>
let _tokenProvider: TokenProvider | null = null

export function registerTokenProvider(fn: TokenProvider) {
  _tokenProvider = fn
}

export async function resolveToken(): Promise<string | null> {
  if (_tokenProvider) return await _tokenProvider()
  return getAccessToken() // fallback to localStorage
}