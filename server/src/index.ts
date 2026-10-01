import express from "express"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env["CLIENT_CORS_ORIGIN_URL"] }))

app.get("/api/portfolio", async (req, res) => {
    
})

app.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date() })
})
app.listen(process.env["SERVER_PORT"], () => console.log("server started..."))