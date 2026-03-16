'use client'

import {getToken, useAuth} from '@clerk/nextjs'
import { useEffect } from 'react'
import { registerTokenProvider } from '@/lib/api/session'

export function ClerkTokenProvider({ children }: { children: React.ReactNode }) {
    const { getAuth } = useAuth()

    useEffect(() => {
        registerTokenProvider(() => getToken())
    }, [getToken])

    return <>{children}</>
}