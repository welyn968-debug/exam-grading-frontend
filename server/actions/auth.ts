import {
  login,
  register,
  requestPasswordReset as requestPasswordResetApi,
  updatePassword as updatePasswordApi,
} from '@/lib/api/auth'
import { ApiRequestError } from '@/lib/api/http'

type SignInPayload = {
  email: string
  password: string
}

type SignUpPayload = {
  email: string
  password: string
  name: string
}

function readErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export async function signIn(payload: SignInPayload) {
  try {
    const result = await login(payload)
    return { success: true, user: result.user }
  } catch (error) {
    return { error: readErrorMessage(error) }
  }
}

export async function signUp(payload: SignUpPayload) {
  try {
    const user = await register(payload)
    return { success: true, user }
  } catch (error) {
    return { error: readErrorMessage(error) }
  }
}

export async function requestPasswordReset(payload: { email: string }) {
  try {
    const result = await requestPasswordResetApi(payload)
    return { success: result.success }
  } catch (error) {
    return { error: readErrorMessage(error) }
  }
}

export async function updatePassword(payload: {
  password: string
  token?: string
}) {
  try {
    const result = await updatePasswordApi(payload)
    if (!result.success) {
      return { error: 'Could not update password. Please request a new reset link.' }
    }
    return { success: true }
  } catch (error) {
    return { error: readErrorMessage(error) }
  }
}
