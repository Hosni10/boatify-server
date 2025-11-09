import express from "express"
import { ObjectId } from "mongodb"
import { connectToDatabase, COLLECTIONS } from "../services/db.js"
import type { Payment } from "../lib/types.js"

const router = express.Router()

// Get all payments
router.get("/", async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const paymentsCollection = db.collection(COLLECTIONS.PAYMENTS)

    const payments = await paymentsCollection.find({}).toArray()
    res.json({ success: true, data: payments })
  } catch (error) {
    console.error("Get payments error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get payment by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { db } = await connectToDatabase()
    const paymentsCollection = db.collection(COLLECTIONS.PAYMENTS)

    const payment = await paymentsCollection.findOne({ _id: new ObjectId(id) })
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    res.json({ success: true, data: payment })
  } catch (error) {
    console.error("Get payment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create payment
router.post("/", async (req, res) => {
  try {
    const { bookingId, amount, currency = "USD", paymentMethod, transactionId } = req.body

    if (!bookingId || !amount) {
      return res.status(400).json({ error: "Booking ID and amount are required" })
    }

    const { db } = await connectToDatabase()
    const paymentsCollection = db.collection(COLLECTIONS.PAYMENTS)
    const bookingsCollection = db.collection(COLLECTIONS.BOOKINGS)

    // Verify booking exists
    const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) })
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    const payment: Payment = {
      bookingId,
      amount,
      currency,
      status: "pending",
      paymentMethod: paymentMethod || "credit_card",
      transactionId: transactionId || `txn_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await paymentsCollection.insertOne(payment)

    // Update booking payment status
    await bookingsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { paymentStatus: "paid", updatedAt: new Date() } },
    )

    res.status(201).json({ success: true, data: { ...payment, _id: result.insertedId } })
  } catch (error) {
    console.error("Create payment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update payment status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["pending", "completed", "failed", "refunded"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const { db } = await connectToDatabase()
    const paymentsCollection = db.collection(COLLECTIONS.PAYMENTS)

    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Payment not found" })
    }

    const updatedPayment = await paymentsCollection.findOne({ _id: new ObjectId(id) })
    res.json({ success: true, data: updatedPayment })
  } catch (error) {
    console.error("Update payment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router

