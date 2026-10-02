/** Format a number as Indian Rupees (₹) with compact notation */
export function fmtINR(value: number, compact = false): string {
  if (compact) {
    const abs = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)}Cr`
    if (abs >= 1_00_000)    return `${sign}₹${(abs / 1_00_000).toFixed(2)}L`
    if (abs >= 1_000)       return `${sign}₹${(abs / 1_000).toFixed(1)}K`
    return `${sign}₹${abs.toFixed(0)}`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

/** Format a percentage with a +/- sign */
export function fmtPct(value: number, decimals = 2): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}


export function glClass(value: number): string {
  if (value > 0) return 'gain'
  if (value < 0) return 'loss'
  return 'neutral'
}

export function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-IN', { hour12: false })
}

/** Compute a green↔red fill colour based on % gain/loss for treemap */
export function gainLossColor(pct: number): string {
  const clamped = Math.max(-20, Math.min(20, pct))
  if (clamped >= 0) {
    const intensity = Math.round(40 + (clamped / 20) * 60) // 40-100% green
    return `hsl(142, 72%, ${100 - intensity / 2}%)`
  } else {
    const intensity = Math.round(40 + (Math.abs(clamped) / 20) * 60)
    return `hsl(4, 86%, ${100 - intensity / 2}%)`
  }
}
