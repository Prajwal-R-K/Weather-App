export type FetchError = { status: number; message: string }

export async function abortableJson<T>(input: RequestInfo, init?: RequestInit & { signal?: AbortSignal }): Promise<T> {
  const ctrl = new AbortController()
  const signal = init?.signal
  const timeout = setTimeout(() => ctrl.abort('timeout'), 12000)
  try {
    const resp = await fetch(input, { ...init, signal: signal ?? ctrl.signal })
    if (!resp.ok) throw { status: resp.status, message: resp.statusText } as FetchError
    return (await resp.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}
