import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectToDatabase, createIndexes } from "./services/db.js"
import authRoutes from "./routes/auth.js"
import boatsRoutes from "./routes/boats.js"
import bookingsRoutes from "./routes/bookings.js"
import availabilityRoutes from "./routes/availability.js"
import paymentsRoutes from "./routes/payments.js"
import companyRoutes from "./routes/company.js"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/boats", boatsRoutes)
app.use("/api/bookings", bookingsRoutes)
app.use("/api/availability", availabilityRoutes)
app.use("/api/payments", paymentsRoutes)
app.use("/api/company", companyRoutes)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(500).json({ error: "Internal server error", message: err.message })
})

// Initialize database and start server
async function startServer() {
  try {
    const { db } = await connectToDatabase()
    await createIndexes(db)
    console.log("✅ Database connected and indexes created")

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

startServer()


