'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function ClerkSsoCallback() {
  return <AuthenticateWithRedirectCallback />
}
