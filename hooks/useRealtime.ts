'use client'

import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { WS_BASE_URL } from '@/lib/api'
import { getAccessToken } from '@/lib/api/session'
import { logger } from '@/lib/logger'

type RealtimeEvents = {
  ocr_progress?: (payload: unknown) => void
  grading_progress?: (payload: unknown) => void
  review_ready?: (payload: unknown) => void
  notification?: (payload: unknown) => void
  testing_ocr_progress?: (payload: unknown) => void
  testing_grading_progress?: (payload: unknown) => void
  testing_complete?: (payload: unknown) => void
}

type RealtimeOptions = {
  enabled?: boolean
  namespace?: string
}

export function useRealtime(
  events: RealtimeEvents,
  options: RealtimeOptions = {},
): void {
  const socketRef = useRef<Socket | null>(null)
  const enabled = options.enabled ?? true
  const namespace = options.namespace ?? '/exams'

  useEffect(() => {
    if (!enabled) return

    const token = getAccessToken()
    if (!token) return

    const socket = io(`${WS_BASE_URL}${namespace}`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      auth: { token: `Bearer ${token}` },
    })

    socket.on('connect_error', (error) => {
      logger.warn('socket_connect_error', error.message)
    })

    if (events.ocr_progress) {
      socket.on('ocr_progress', events.ocr_progress)
    }
    if (events.grading_progress) {
      socket.on('grading_progress', events.grading_progress)
    }
    if (events.review_ready) {
      socket.on('review_ready', events.review_ready)
    }
    if (events.notification) {
      socket.on('notification', events.notification)
    }
    if (events.testing_ocr_progress) {
      socket.on('testing_ocr_progress', events.testing_ocr_progress)
    }
    if (events.testing_grading_progress) {
      socket.on('testing_grading_progress', events.testing_grading_progress)
    }
    if (events.testing_complete) {
      socket.on('testing_complete', events.testing_complete)
    }

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [
    enabled,
    namespace,
    events.grading_progress,
    events.notification,
    events.ocr_progress,
    events.review_ready,
    events.testing_complete,
    events.testing_grading_progress,
    events.testing_ocr_progress,
  ])
}
