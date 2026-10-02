import { getGoogleFinanceMetrics, getScreenerMetrics, type FundaMetrics } from "../services/googleFinance.js"
import { mapLimit } from "./utils.js"

interface StockRef { yahooSymbol: string; googleSymbol: string; ticker: string }

const TTL_MS = 30 * 60_000 // 30mins
const cache = new Map<string, FundaMetrics & { fetchedAt: number }>()
let refreshing: Promise<void> | null = null

export const getCachedFundametrics = (yahooSymbol: string) => cache.get(yahooSymbol)

async function scrape(s: StockRef): Promise<FundaMetrics> {
    const g = await getGoogleFinanceMetrics(s.googleSymbol).catch(() => null)
    if (g && g.peRatio !== null && g.latestEarnings !== null) return g

    const sc = await getScreenerMetrics(s.ticker).catch(() => null)
    return sc ?? g ?? { peRatio: null, latestEarnings: null }
}

// Concurrent callers share 1 refresh
export function refreshFundametrics(stocks: StockRef[]): Promise<void> {
    refreshing ??= (async () => {
        const stale = stocks.filter(
            (s) => Date.now() - (cache.get(s.yahooSymbol)?.fetchedAt ?? 0) > TTL_MS
        )
        await mapLimit(stale, 5, async (s) => {
            cache.set(s.yahooSymbol, { ...(await scrape(s)), fetchedAt: Date.now() })
        })
    })().finally(() => { refreshing = null })
    return refreshing
}