// "₹1,234.50" -> 1234.5 | "-" or "" -> null
export const parseNumber = (raw: string): number | null => {
    if (!/\d/.test(raw)) return null
    const n = Number(raw.replace(/\u2212/g, "-").replace(/[^0-9.\-]/g, ""))
    return Number.isNaN(n) ? null : n
}

// round to 2 digits
export const r2 = (n: number) => Number(n.toFixed(2))

// Run fn over items with at most `limit` running at once (fn must not throw)
export async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
    let i = 0
    const worker = async () => {
        while (i < items.length) await fn(items[i++]!)
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
}