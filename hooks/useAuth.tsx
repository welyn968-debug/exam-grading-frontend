'use client'

import {
  useAuth as useClerkAuth,
  useUser,
  useSignIn,
  useSignUp,
  useClerk,
} from '@clerk/nextjs'
import {
  clearSessionTokens,
  clearStoredUser,
  getStoredUser,
  setSessionTokens,
  setStoredUser,
} from '@/lib/api/session'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '@/lib/api'
import type { UserResource } from '@clerk/types'

type LoginInput = {
  email: string
  password: string
}

type SignupInput = {
  name: string
  email: string
  password: string
  institution?: string
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  login: (payload: LoginInput) => Promise<void>
  signup: (payload: SignupInput) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  completeOnboarding: () => void
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
}

const ONBOARDING_KEY = 'examgrader.onboarding_completed'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readOnboardingState(): boolean {
  if (typeof window === 'undefined') return true
  const value = localStorage.getItem(ONBOARDING_KEY)
  if (!value) return true
  return value === 'true'
}

function mapUser(user: UserResource | null | undefined): AuthUser | null {
  if (!user) return null

  const role =
    typeof user.publicMetadata?.role === 'string'
      ? (user.publicMetadata.role as string)
      : 'lecturer'

  const institution =
    typeof user.publicMetadata?.institution === 'string'
      ? (user.publicMetadata.institution as string)
      : undefined

  return {
    id: user.id,
    name:
      user.fullName ??
      user.username ??
      user.primaryEmailAddress?.emailAddress ??
      'Lecturer',
    email: user.primaryEmailAddress?.emailAddress ?? undefined,
    role,
    institution,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, signOut, getToken } = useClerkAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { setActive } = useClerk()

  const [userState, setUserState] = useState<AuthUser | null>(() =>
    getStoredUser<AuthUser>(),
  )
  const [isBusy, setIsBusy] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean>(true)

  const syncSessionToken = useCallback(async () => {
    if (!isSignedIn || !getToken) return
    try {
      const token = await getToken()
      if (token) {
        setSessionTokens({ accessToken: token, refreshToken: token })
      }
    } catch {
      clearSessionTokens()
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    setHasCompletedOnboarding(readOnboardingState())
  }, [])

  useEffect(() => {
    if (!authLoaded || !userLoaded) return

    if (isSignedIn) {
      const mapped = mapUser(user)
      if (mapped) {
        setUserState(mapped)
        setStoredUser(mapped)
        void syncSessionToken()
      }
    } else {
      clearSessionTokens()
      clearStoredUser()
      setUserState(null)
    }
  }, [authLoaded, isSignedIn, syncSessionToken, user, userLoaded])

  const login = useCallback(
    async (payload: LoginInput) => {
      if (!signInLoaded || !signIn) {
        throw new Error('Authentication is not ready yet.')
      }
      setIsBusy(true)
      try {
        const result = await signIn.create({
          identifier: payload.email,
          password: payload.password,
        })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          await syncSessionToken()
        } else {
          throw new Error('Additional steps are required to sign in.')
        }
      } finally {
        setIsBusy(false)
      }
    },
    [setActive, signIn, signInLoaded, syncSessionToken],
  )

  const signup = useCallback(
    async (payload: SignupInput) => {
      if (!signUpLoaded || !signUp) {
        throw new Error('Sign up is not ready yet.')
      }
      setIsBusy(true)
      try {
        const result = await signUp.create({
          emailAddress: payload.email,
          password: payload.password,
          firstName: payload.name,
          unsafeMetadata: {
            institution: payload.institution,
          },
          publicMetadata: {
            role: 'lecturer',
            institution: payload.institution,
          },
        })

        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId })
          const mapped = mapUser(result.createdUserId ? user : null)
          if (mapped) {
            setStoredUser(mapped)
            setUserState(mapped)
          }
          await syncSessionToken()
          return
        }

        if (result.status === 'missing_requirements') {
          throw new Error('Email verification required. Please check your inbox.')
        }

        throw new Error('Could not complete sign up. Please try again.')
      } finally {
        setIsBusy(false)
      }
    },
    [setActive, signUp, signUpLoaded, syncSessionToken, user],
  )

  const logout = useCallback(async () => {
    setIsBusy(true)
    try {
      await signOut()
    } finally {
      clearSessionTokens()
      clearStoredUser()
      setUserState(null)
      setIsBusy(false)
    }
  }, [signOut])

  const refreshUser = useCallback(async () => {
    if (user && typeof user.reload === 'function') {
      await user.reload()
      const mapped = mapUser(user)
      if (mapped) {
        setStoredUser(mapped)
        setUserState(mapped)
      }
    }
  }, [user])

  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    }
    setHasCompletedOnboarding(true)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!signInLoaded || !signIn) {
      throw new Error('Authentication is not ready yet.')
    }
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/auth/login',
      redirectUrlComplete: '/dashboard',
    })
  }, [signIn, signInLoaded])

  const loginWithFacebook = useCallback(async () => {
    if (!signInLoaded || !signIn) {
      throw new Error('Authentication is not ready yet.')
    }
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_facebook',
      redirectUrl: '/auth/login',
      redirectUrlComplete: '/dashboard',
    })
  }, [signIn, signInLoaded])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: userState,
      isLoading: isBusy || !authLoaded || !userLoaded,
      isAuthenticated: Boolean(isSignedIn),
      hasCompletedOnboarding,
      login,
      signup,
      logout,
      refreshUser,
      completeOnboarding,
      loginWithGoogle,
      loginWithFacebook,
    }),
    [
      authLoaded,
      hasCompletedOnboarding,
      isBusy,
      isSignedIn,
      login,
      loginWithFacebook,
      loginWithGoogle,
      logout,
      signup,
      refreshUser,
      userLoaded,
      userState,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
