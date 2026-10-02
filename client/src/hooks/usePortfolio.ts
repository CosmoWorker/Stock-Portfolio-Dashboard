import { useCallback, useEffect, useRef, useState } from 'react'
import type { PortfolioResponse } from '../types'

const POLL_MS = 15_000

export interface PortfolioState {
  data: PortfolioResponse | null
  /** session-only price history */
  history: number[]
  updatedAt: Date | null
  source: 'live' | 'cache' | null
  loading: boolean
  error: string | null
}

export function usePortfolio(): PortfolioState {
  const [state, setState] = useState<PortfolioState>({
    data: null,
    history: [],
    updatedAt: null,
    source: null,
    loading: true,
    error: null,
  })

  // Keep history in a ref so the interval closure sees latest array
  const historyRef = useRef<number[]>([])

  const fetchPortfolio = useCallback(async () => {
    try {
      const URL = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${URL}/api/portfolio`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: PortfolioResponse = await res.json()

      const pv = json.summary.totalPresentValue
      historyRef.current = [...historyRef.current, pv].slice(-60) // keep last 60 samples

      setState(prev => ({
        data: json,
        history: historyRef.current,
        updatedAt: new Date(),
        source: json.source,
        loading: false,
        error: prev.data ? null : prev.error,
      }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch'
      setState(prev => ({
        ...prev,
        loading: false,
        // Keep previous good data, just overview the error
        error: prev.data ? null : msg,
      }))
      console.warn('[usePortfolio] poll failed:', msg)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
    // poll every 15 s
    const id = setInterval(fetchPortfolio, POLL_MS)
    return () => clearInterval(id)
  }, [fetchPortfolio])

  return state
}
