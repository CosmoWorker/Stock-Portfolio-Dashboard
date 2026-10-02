// Field names match the server response by /api/portfolio

export interface Holding {
  name: string
  yahooSymbol: string
  googleSymbol: string
  ticker: string
  sector: string
  exchange: string
  purchasePrice: number
  quantity: number
  investment: number
  portfolioPercent: number
  cmp: number
  presentValue: number
  gainloss: number
  gainlossPercentage: number
  peRatio: number | null
  latestEarnings: number | null
}

export interface SectorData {
  totalInvestment: number
  totalPresentValue: number
  totalGainLoss: number
  stocks: Holding[]
}

export interface Summary {
  totalInvestment: number
  totalPresentValue: number
  totalGainLoss: number
  totalGainLossPercentage: number
}

export interface PortfolioResponse {
  source: 'live' | 'cache'
  summary: Summary
  sectors: Record<string, SectorData>
  holdings: Holding[]
}
