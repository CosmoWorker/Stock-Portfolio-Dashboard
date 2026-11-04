import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const getCurrentMarketPrices = async (symbols: string[], retries = 4): Promise<Map<string, any>> => {
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
    } catch (e: any) {
        const is429 = e?.message?.includes('429') || e?.statusCode === 429
        if (retries > 0) {
            // 429 = IP rate-limited by Yahoo: wait much longer (exponential backoff)
            // other errors: short retry
            const wait = is429
                ? (5 - retries) * 8000  // 8s, 16s, 24s, 32s across retries
                : 1500
            console.warn(`Yahoo fetch failed (${is429 ? '429 rate-limit' : 'error'}), retrying in ${wait}ms... (${retries} left)`)
            await sleep(wait)
            return getCurrentMarketPrices(symbols, retries - 1)
        }
        console.error("Error during Yahoo Fetching: ", e)
        throw new Error(`Error during yahoo fetching ${e}`)
    }
};