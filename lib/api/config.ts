const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v2'
const DEFAULT_WS_BASE_URL = 'http://localhost:5000'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? DEFAULT_WS_BASE_URL
