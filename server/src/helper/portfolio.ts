import portfolioData from "../../data/Parsed_Raw_Portfolio_Data.json" with { type: "json" }
import { getCurrentMarketPrices } from "../services/yahooFinance.js"
import { getCachedFundametrics, refreshFundametrics } from "./fundametrics.js"
import { r2 } from "./utils.js"

export const setPortfolio = async () => {
    void refreshFundametrics(portfolioData)
    const yahooSymbols = portfolioData.map((s) => s.yahooSymbol)
    const marketPrices = await getCurrentMarketPrices(yahooSymbols)

    const holdings = portfolioData.map(s => {
        const y = marketPrices.get(s.yahooSymbol)
        const cmp = y?.price || s.purchasePrice

        const f = getCachedFundametrics(s.yahooSymbol)
        const presentValue = r2(cmp * s.quantity)
        const gainloss = r2(presentValue - s.investment)
        return {
            ...s,
            cmp: cmp,
            presentValue: presentValue,
            gainloss: gainloss,
            gainlossPercentage: r2((gainloss / s.investment) * 100),
            peRatio: f?.peRatio ?? y.fallbackPE,
            latestEarnings: f?.latestEarnings ?? y.fallbackEPS,
        }
    })

    const sectors: Record<string, { totalInvestment: number, totalGainLoss: number, totalPresentValue: number, stocks: any }> = {}
    for (const h of holdings) {
        if (!sectors[h.sector]) {
            sectors[h.sector] = { totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0, stocks: [] };
        }
        const sect = sectors[h.sector]!
        sect.stocks.push(h)
        sect.totalInvestment = r2(sect.totalInvestment + h.investment)
        sect.totalPresentValue = r2(sect.totalPresentValue + h.presentValue)
        sect.totalGainLoss = r2(sect.totalGainLoss + h.gainloss)
    }

    const totalInvestmentVal = r2(holdings.reduce((a, h) => a + h.investment, 0))
    const totalPresentVal = r2(holdings.reduce((a, h) => a + h.presentValue, 0))
    const totalGainLossVal = r2(totalPresentVal - totalInvestmentVal)

    return {
        summary: {
            totalInvestment: totalInvestmentVal,
            totalPresentValue: totalPresentVal,
            totalGainLoss: totalGainLossVal,
            totalGainLossPercentage: r2((totalGainLossVal / totalInvestmentVal) * 100)
        },
        sectors,
        holdings
    }
}