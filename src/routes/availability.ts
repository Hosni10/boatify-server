import express from "express"
import { connectToDatabase, COLLECTIONS } from "../services/db.js"
import { isBoatAvailable, getAvailableBoats, getAvailabilityCalendar, getNextAvailableDate } from "../services/availability.js"
import type { Booking } from "../lib/types.js"

const router = express.Router()

// Check availability for a date range
router.post("/check", async (req, res) => {
  try {
    const { boatId, startDate, endDate } = req.body

    if (!boatId || !startDate || !endDate) {
      return res.status(400).json({ error: "Boat ID, start date, and end date are required" })
    }

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)

    const bookings = (await bookingsCollection.find({}).toArray()) as Booking[]
    const available = isBoatAvailable(boatId, new Date(startDate), new Date(endDate), bookings)

    res.json({ success: true, data: { available } })
  } catch (error) {
    console.error("Check availability error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get available boats for a date range
router.post("/boats", async (req, res) => {
  try {
    const { startDate, endDate } = req.body

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" })
    }

    const { db } = await connectToDatabase()
    const boatsCollection = db.collection(COLLECTIONS.BOATS)
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)

    const boats = await boatsCollection.find({}).toArray()
    const bookings = (await bookingsCollection.find({}).toArray()) as Booking[]

    const availableBoats = getAvailableBoats(boats, new Date(startDate), new Date(endDate), bookings)

    res.json({ success: true, data: availableBoats })
  } catch (error) {
    console.error("Get available boats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get availability calendar for a boat
router.get("/calendar/:boatId", async (req, res) => {
  try {
    const { boatId } = req.params
    const { month, year } = req.query

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" })
    }

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)

    const bookings = (await bookingsCollection.find({}).toArray()) as Booking[]
    const calendar = getAvailabilityCalendar(boatId, parseInt(month as string), parseInt(year as string), bookings)

    res.json({ success: true, data: calendar })
  } catch (error) {
    console.error("Get calendar error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get next available date for a boat
router.get("/next/:boatId", async (req, res) => {
  try {
    const { boatId } = req.params

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)

    const bookings = (await bookingsCollection.find({}).toArray()) as Booking[]
    const nextDate = getNextAvailableDate(boatId, bookings)

    res.json({ success: true, data: { nextAvailableDate: nextDate } })
  } catch (error) {
    console.error("Get next available date error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router


