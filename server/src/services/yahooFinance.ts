import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const getCurrentMarketPrices = async (symbols: string[], retries = 1): Promise<Map<string, any>> => {
    try {
        const quotes = await yahooFinance.quote(symbols, {
            fields: ["symbol", "regularMarketPrice", "preMarketPrice", "postMarketPrice", "trailingPE", "epsTrailingTwelveMonths"]
        });
        const priceMap = new Map();
        for (const q of quotes) {
            priceMap.set(q.symbol, {
                price: q.regularMarketPrice || q.preMarketPrice || q.postMarketPrice,
                fallbackPE: q.trailingPE,
                fallbackEPS: q.epsTrailingTwelveMonths,
            });
        }
        return priceMap;
    } catch (e) {
        if (retries > 0) {
            console.warn("fetch timed out/failed, retrying once...");
            await new Promise((r) => setTimeout(r, 600));
            return getCurrentMarketPrices(symbols, retries - 1);
        }
        console.error("Error during Yahoo Fetching: ", e);
        throw new Error(`Error during yahoo fetching ${e}`);
    }
};