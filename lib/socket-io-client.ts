type Listener = (payload?: unknown) => void

type SocketOptions = {
  autoConnect?: boolean
  [key: string]: unknown
}

export type Socket = {
  on: (event: string, listener: Listener) => Socket
  off: (event: string, listener: Listener) => Socket
  emit: (event: string, payload?: unknown) => Socket
  disconnect: () => void
}

class NoopSocket implements Socket {
  private listeners = new Map<string, Set<Listener>>()

  on(event: string, listener: Listener): Socket {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(listener)
    return this
  }

  off(event: string, listener: Listener): Socket {
    this.listeners.get(event)?.delete(listener)
    return this
  }

  emit(event: string, payload?: unknown): Socket {
    this.listeners.get(event)?.forEach((listener) => listener(payload))
    return this
  }

  disconnect(): void {
    this.listeners.clear()
  }
}

export function io(_url: string, _options?: SocketOptions): Socket {
  return new NoopSocket()
}
