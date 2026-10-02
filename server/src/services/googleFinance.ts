import * as cheerio from "cheerio"
import axios from "axios"
import { parseNumber } from "../helper/utils.js";


const UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

export interface FundaMetrics {
    peRatio: number | null;
    latestEarnings: number | null;
}

export const getGoogleFinanceMetrics = async (symbol: string): Promise<FundaMetrics> => {
    try {
        const url = `https://google.com/finance/quote/${symbol}`
        const response = await axios.get(url, {
            headers: UA,
            timeout: 10000,
            family: 4,          // force IPv4 — IPv6 is unreachable on this host
        })
        const $ = cheerio.load(response.data)
        const out: FundaMetrics = { peRatio: null, latestEarnings: null }
        $('.KxsRFb').each((_, el) => {
            const label = $(el).find(".SwQK7").text().trim().toLowerCase();
            const val = parseNumber($(el).find(".dO6ijd").text());

            if (label === "p/e ratio") out.peRatio = val
            else if (label === "eps") out.latestEarnings = val
            // may add cmp
        });

        if (out.peRatio === null || out.latestEarnings === null) {
            $("div")
                .filter((_, el) => $(el).children().length === 0)
                .each((_, el) => {
                    const label = $(el).text().trim().toLowerCase()
                    if (label === "p/e ratio" && out.peRatio === null) {
                        out.peRatio = parseNumber($(el).next().text())
                    } else if (label === "eps" && out.latestEarnings === null) {
                        out.latestEarnings = parseNumber($(el).next().text())
                    }
                    //might add cmp fallback    
                })
        }

        return out

    } catch (e) {
        console.error("Error fetching Metrics: ", e)
        throw new Error(`Error fetching Google metrics for ${symbol}: ${e}`)
    }
}

// fallback highly likely
export const getScreenerMetrics = async (ticker: string): Promise<FundaMetrics> => {
    try {
        const url = `https://screener.in/company/${ticker}/consolidated/`
        const response = await axios.get(url, {
            headers: UA,
            timeout: 10000,
            family: 4,          // force IPv4 if ipv6 is unreachable
        })

        const $ = cheerio.load(response.data)
        const out: FundaMetrics = { peRatio: null, latestEarnings: null }

        $('#top-ratios li').each((_, el) => {
            const label = $(el).find('.name').text().trim().toLowerCase();
            const value = $(el).find('.value .number').text().trim()
            if (/^stock p\/e$/i.test(label)) {
                out.peRatio = parseNumber(value.replace(/\s+/g, ''))
                return false
            }
        })

        $('#profit-loss table.data-table tr').each((_, el) => {
            const rowText = $(el).find('td:first-child').text().trim().toLowerCase();

            if (/eps in rs/i.test(rowText)) {
                const latestTd = $(el).find('td').last().text().trim();
                if (latestTd) out.latestEarnings = parseNumber(latestTd.replace(/\s+/g, ''))
                return false
            }
        })

        return out
    } catch (e) {
        console.error("Error fetching Metrics: ", e)
        throw new Error(`Error fetching Screener metrics for ${ticker}: ${e}`)
    }
}

// (async () => {
//     // console.log(await getGoogleFinanceMetrics("544028:BOM"))
//     console.log(await getScreenerMetrics("AFFLE"))
// })();   
