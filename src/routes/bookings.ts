import express from "express"
import { ObjectId } from "mongodb"
import { connectToDatabase, COLLECTIONS } from "../services/db.js"
import { createBooking, cancelBooking, completeBooking } from "../services/booking-service.js"
import type { Booking } from "../lib/types.js"

const router = express.Router()

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)

    const bookings = await bookingsCollection.find({}).toArray()
    res.json({ success: true, data: bookings })
  } catch (error) {
    console.error("Get bookings error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get booking by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)

    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) })
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    res.json({ success: true, data: booking })
  } catch (error) {
    console.error("Get booking error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create booking
router.post("/", async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)
    const boatsCollection = db.collection(COLLECTIONS.BOATS)

    // Get existing bookings
    const existingBookings = (await bookingsCollection.find({}).toArray()) as Booking[]

    // Get boat to get price
    const boat = await boatsCollection.findOne({ _id: new ObjectId(req.body.boatId) })
    if (!boat) {
      return res.status(404).json({ error: "Boat not found" })
    }

    // Create booking using service
    const result = await createBooking(
      {
        ...req.body,
        boatPrice: boat.price,
      },
      existingBookings,
    )

    if (!result.success) {
      return res.status(400).json(result)
    }

    // Save to database
    const insertResult = await bookingsCollection.insertOne(result.data!)
    const newBooking = await bookingsCollection.findOne({ _id: insertResult.insertedId })

    res.status(201).json({ success: true, data: newBooking })
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update booking status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)

    const booking = (await bookingsCollection.findOne({ _id: new ObjectId(id) })) as Booking | null
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    let result
    if (status === "cancelled") {
      result = cancelBooking(booking)
    } else if (status === "completed") {
      result = completeBooking(booking)
    } else {
      booking.status = status as Booking["status"]
      booking.updatedAt = new Date()
      result = { success: true, data: booking }
    }

    if (!result.success) {
      return res.status(400).json(result)
    }

    await bookingsCollection.updateOne({ _id: new ObjectId(id) }, { $set: result.data })
    res.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Update booking error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router

