import XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import axios from "axios"

const filepath = path.join(process.cwd(), "./data/F9001561_ADDBA737E8_B72562937A.xlsx")
const workbook = XLSX.readFile(filepath)

interface PortfolioItem {
    id: number;
    sector: string;
    name: string;
    purchasePrice: number;
    quantity: number;
    investment: number;
    portfolioPercent?: number;
    exchange: 'BSE' | 'NSE';
    ticker: string;
    yahooSymbol: string;
    googleSymbol: string;
}

const getBseScriptIds = async () => {
    const res = await axios.get("https://api.kite.trade/instruments/BSE");
    const csv = res.data;
    const lines = csv.split("\n");

    let bseMap = new Map<string, string>();
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length > 2) {
            const exchangeToken = cols[1]; // numeric ticker e.g., '532174'
            const scripId = cols[2];       // alpha ticker e.g., 'ICICIBANK'
            bseMap.set(exchangeToken, scripId);
        }
    }
    return bseMap;
}

const sheetName = workbook.SheetNames[0]
if (!sheetName) {
    throw new Error(`Possible Empty Sheetname`)
}
const worksheet = workbook.Sheets[sheetName]

const jrow = XLSX.utils.sheet_to_json<any[]>(worksheet!, { header: 1, defval: null })

const bseIdMap = await getBseScriptIds()
let portfolio: PortfolioItem[] = []
let currSector = "General";

for (const row of jrow) {
    const col0 = row[0]; // No.
    const col1 = row[1]; // Particulars
    const col2 = row[2] // Purchase Price
    const col3 = row[3] // qty
    const col4 = row[4] // investment
    const col6 = row[6] // exchange ticker symbol

    if (!col1 || col1 === 'Particulars') {
        continue;
    }

    if (col0 === null || col0 === undefined) {
        currSector = String(col1).trim();
        continue;
    }

    const rawTicker = String(col6 || '').trim();
    const isNumericBse = /^\d+$/.test(rawTicker);
    const exchange = isNumericBse ? 'BSE' : 'NSE';

    let yahooSymbol = ''
    if (isNumericBse) {
        const scripId = bseIdMap.get(rawTicker) || rawTicker;
        yahooSymbol = `${scripId}.BO`
    } else {
        yahooSymbol = `${rawTicker}.NS`
    }

    const googleSymbol = isNumericBse ? `${rawTicker}:BOM` : `${rawTicker}:NSE`

    portfolio.push({
        id: portfolio.length + 1,
        sector: currSector,
        name: String(col1).trim(),
        purchasePrice: Number(col2 || 0),
        quantity: Number(col3 || 0),
        investment: Number(col4 || 0),
        exchange: exchange,
        ticker: rawTicker,
        yahooSymbol: yahooSymbol,
        googleSymbol: googleSymbol,
    })
}

const totalinvestment = portfolio.reduce((acc, curr) => acc + curr.investment, 0)
portfolio.forEach(d => {
    d.portfolioPercent = Number(((d.investment / totalinvestment) * 100).toFixed(2))
})

const outputPath = path.join(process.cwd(), "./data/Parsed_Raw_Portfolio_Data.json")
fs.writeFileSync(outputPath, JSON.stringify(portfolio, null, 2), 'utf-8')