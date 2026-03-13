type LogPayload = unknown

function formatScope(scope: string): string {
  return `[examgrader:${scope}]`
}

export const logger = {
  info(scope: string, payload?: LogPayload) {
    if (payload === undefined) {
      console.info(formatScope(scope))
      return
    }
    console.info(formatScope(scope), payload)
  },
  warn(scope: string, payload?: LogPayload) {
    if (payload === undefined) {
      console.warn(formatScope(scope))
      return
    }
    console.warn(formatScope(scope), payload)
  },
  error(scope: string, payload?: LogPayload) {
    if (payload === undefined) {
      console.error(formatScope(scope))
      return
    }
    console.error(formatScope(scope), payload)
  },
}
