import * as cheerio from "cheerio"
import axios from "axios"


const UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/[IP_ADDRESS] Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

export const getGoogleFinanceMetrics = async (symbol: string) => {


    try {
        const url = `https://google.com/finance/quote/${symbol}`
        const response = await axios.get(url, {
            headers: UA,
            timeout: 5000
        })
        const $ = cheerio.load(response.data)
        let peRatio: number | null = null;
        let latestEarnings: number | null = null;
        $('.KxsRFb').each((_, el) => {
            const label = $(el).find(".dO6ijd").text().trim().toLowerCase();
            const val = $(el).find(".dO6ijd").first().text();

            if (label.startsWith("p/e ratio")) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed)) peRatio = parsed;
            }
            if (label.startsWith("eps")) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed)) latestEarnings = parsed;
            }
        });

        $('div').each((_, el) => {
            const text = $(el).text().trim().toLowerCase()
            if (/^p\/e ratio$/i.test(text) && !peRatio) {
                const siblingText = $(el).next().text().trim()
                if (siblingText) { peRatio = parseFloat(siblingText) }
            }
            if (/^eps$/i.test(text) && !latestEarnings) {
                const siblingText = $(el).next().text().trim()
                if (siblingText) { latestEarnings = parseFloat(siblingText) }
            }

        })

        return { peRatio, latestEarnings }

    } catch (e) {
        console.error("Error fetching Metrics: ", e)
        throw new Error(`Error fetching Google metrics for ${symbol}: ${e}`)
    }
}

// fallback highly likely
const getScreenerMetrics = async (symbol: string) => {
    try {
        const url = `https://screener.in/company/${symbol}/consolidated/`
        const response = await axios.get(url, {
            headers: UA,
            timeout: 5000
        })

        const $ = cheerio.load(response.data)
        let stockPE: number | null = null;
        let epsTTM: number | null = null;

        $('#top-ratios li').each((_, el) => {
            const label = $(el).find('.name').text().trim().toLowerCase();
            if (/^stock p\/e$/i.test(label)) {
                const val = $(el).find('.value .number').text().trim()
                const stockPE = val.replace(/\s+/g, '')
                return false
            }
        })

        $('#profit-loss table.data-table tr').each((_, el) => {
            const rowText = $(el).find('td:first-child').text().trim().toLowerCase();

            if (/eps in rs/i.test(rowText)) {
                const latestTd = $(el).find('td').last().text().trim();
                if (latestTd) epsTTM = parseFloat(latestTd.replace(/s+/g, ''))
                return false
            }
        })

        return { peRatio: stockPE, epsTTM }
    } catch (e) {
        console.error("Error fetching Metrics: ", e)
        throw new Error(`Error fetching Screener metrics for ${symbol}: ${e}`)
    }
}