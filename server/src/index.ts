import express from "express"
import cors from "cors";
import { setPortfolio } from "./helper/portfolio.js";

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env["CLIENT_CORS_ORIGIN_URL"] }))

const cache_ttl_ms = 15000;
type payload = Awaited<ReturnType<typeof setPortfolio>>
let cachedResponse: { data: payload; timestamp: number } | null = null;
let inflight: Promise<payload> | null = null;


app.get("/api/portfolio", async (_, res) => {
  const now = Date.now();

  if (cachedResponse && now - cachedResponse.timestamp < cache_ttl_ms) {
    return res.json({ source: "cache", ...cachedResponse.data });
  }

  try {
    if (!inflight) {
      inflight = setPortfolio()
    }

    const data = await inflight
    cachedResponse = { data, timestamp: Date.now() }
    inflight = null
    return res.json({ source: "live", ...data })

  } catch (e) {
    console.error("Error returning Portfolio Data", e)
    if (cachedResponse) return res.json({ source: "cache", ...cachedResponse.data })
    res.status(500).json({ error: "Failed to Build Portfolio" })
  }
})

app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date() })
})

app.listen(process.env["SERVER_PORT"], () => console.log("server started..."))