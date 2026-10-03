import { useEffect, useState } from 'react'

export function useAsyncData<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    void load().then((value) => { if (active) setData(value) }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load data.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
    // The caller specifies when to reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
