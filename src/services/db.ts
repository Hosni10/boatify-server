// MongoDB Connection Configuration
// Replace with your actual MongoDB connection string

import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  const client = new MongoClient(mongoUri)

  await client.connect()

  const db = client.db(process.env.MONGODB_DB_NAME || "boatflow")

  cachedClient = client
  cachedDb = db

  return { client, db }
}

// Database Schema Definitions
export const COLLECTIONS = {
  USERS: "users",
  BOATS: "boats",
  BOOKINGS: "bookings",
  PAYMENTS: "payments",
  REVIEWS: "reviews",
}

// Create indexes for better query performance
export async function createIndexes(db: Db) {
  // Boats collection indexes
  await db.collection(COLLECTIONS.BOATS).createIndex({ location: 1 })
  await db.collection(COLLECTIONS.BOATS).createIndex({ status: 1 })
  await db.collection(COLLECTIONS.BOATS).createIndex({ companyId: 1 })

  // Bookings collection indexes
  await db.collection(COLLECTIONS.BOOKINGS).createIndex({ boatId: 1 })
  await db.collection(COLLECTIONS.BOOKINGS).createIndex({ customerId: 1 })
  await db.collection(COLLECTIONS.BOOKINGS).createIndex({ startDate: 1, endDate: 1 })
  await db.collection(COLLECTIONS.BOOKINGS).createIndex({ status: 1 })

  // Users collection indexes
  await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true })
  await db.collection(COLLECTIONS.USERS).createIndex({ companyId: 1 })

  // Payments collection indexes
  await db.collection(COLLECTIONS.PAYMENTS).createIndex({ bookingId: 1 })
  await db.collection(COLLECTIONS.PAYMENTS).createIndex({ status: 1 })
}


