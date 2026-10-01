import YahooFinance from "yahoo-finance2"

const yahooFinance = new YahooFinance();

export const getCurrentMarketPrices = async (symbols: string[]) => {
    try {
        const quotes = await yahooFinance.quote(symbols, {
            fields: ["symbol", "regularMarketPrice", "preMarketPrice", "postMarketPrice", "trailingPE", "epsTrailingTwelveMonths"]
        });
        const priceMap = new Map();
        for (const q of quotes) {
            priceMap.set(q.symbol, {
                price: q.regularMarketPrice || q.preMarketPrice || q.postMarketPrice,
                fallbackPE: q.trailingPE,
                fallbackEPS: q.epsTrailingTwelveMonths
            })
        }
        return priceMap
    }
    catch (e) {
        console.error("Error during Yahoo Fetching: ", e)
    }
}