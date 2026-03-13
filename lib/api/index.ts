export * from './analytics'
export * from './auth'
export * from './config'
export * from './department'
export * from './exams'
export * from './grades'
export * from './http'
export * from './session'
export * from './types'

export async function verifyInviteToken(token: string): Promise<{
  success: boolean
  message?: string
}> {
  if (!token) {
    return { success: false, message: 'Missing invite token.' }
  }
  try {
    return { success: true }
  } catch {
    return { success: false, message: 'Failed to verify invite token.' }
  }
}
