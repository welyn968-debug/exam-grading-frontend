type ExchangeResult = {
  error: Error | null
}

type SessionResult = {
  data: {
    session: null
  }
}

type SupabaseStub = {
  auth: {
    exchangeCodeForSession: (code: string) => Promise<ExchangeResult>
    getSession: () => Promise<SessionResult>
  }
}

const supabaseStub: SupabaseStub = {
  auth: {
    async exchangeCodeForSession(_code: string) {
      return { error: null }
    },
    async getSession() {
      return { data: { session: null } }
    },
  },
}

export function getSupabaseClient(): SupabaseStub {
  return supabaseStub
}
