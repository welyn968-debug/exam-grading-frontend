'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function ClerkSignupSsoCallback() {
  return <AuthenticateWithRedirectCallback />
}
