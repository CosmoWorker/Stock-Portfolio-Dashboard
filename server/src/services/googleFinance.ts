import * as cheerio from "cheerio"
import axios from "axios"

export const getFinanceMetrics = async (symbol: string) => {


    try {
        const url = `https://google.finance/quote/${symbol}`
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en,q=0.9",
            },
            timeout: 5000
        })
        const $ = cheerio.load(data)
        let peRatio;
        let latestEarnings;
        $('div[class*="gyFHrc"]').each((_, el) => {
            const label = $(el).find(".mfs7Fc").text().trim().toLowerCase();
            const val = $(el).find(".P6K39c").text().trim().replace(/,/g, "");

            if (label.includes("p/e ratio")) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed)) peRatio = parsed;
            }
            if (label.includes("eps") || label.includes("earnings per share")) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed)) latestEarnings = parsed;
            }
        });

        return { peRatio, latestEarnings }

    } catch (e) {
        console.error("Error fetching Metrics: ", e)
    }
}