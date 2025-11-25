import express from "express"
import { ObjectId } from "mongodb"
import { connectToDatabase, COLLECTIONS } from "../services/db.js"
import type { Boat } from "../lib/types.js"

const router = express.Router()

// Get all boats
router.get("/", async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const boatsCollection = db.collection(COLLECTIONS.BOATS)

    const boats = await boatsCollection.find({}).toArray()
    res.json({ success: true, data: boats })
  } catch (error) {
    console.error("Get boats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get boat by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { db } = await connectToDatabase()
    const boatsCollection = db.collection(COLLECTIONS.BOATS)

    const boat = await boatsCollection.findOne({ _id: new ObjectId(id) })
    if (!boat) {
      return res.status(404).json({ error: "Boat not found" })
    }

    res.json({ success: true, data: boat })
  } catch (error) {
    console.error("Get boat error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create boat
router.post("/", async (req, res) => {
  try {
    const boatData: Boat = req.body

    if (!boatData.name || !boatData.type || !boatData.companyId) {
      return res.status(400).json({ error: "Name, type, and company ID are required" })
    }

    const { db } = await connectToDatabase()
    const boatsCollection = db.collection(COLLECTIONS.BOATS)

    const boat: Boat = {
      ...boatData,
      capacity: boatData.capacity || 0,
      price: boatData.price || 0,
      location: boatData.location || "",
      status: boatData.status || "available",
      features: boatData.features || [],
      image: boatData.image || "",
      rating: boatData.rating || 0,
      reviews: boatData.reviews || 0,
      bookings: boatData.bookings || 0,
      revenue: boatData.revenue || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await boatsCollection.insertOne(boat)
    res.status(201).json({ success: true, data: { ...boat, _id: result.insertedId } })
  } catch (error) {
    console.error("Create boat error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update boat
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const { db } = await connectToDatabase()
    const boatsCollection = db.collection(COLLECTIONS.BOATS)

    updateData.updatedAt = new Date()

    const result = await boatsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Boat not found" })
    }

    const updatedBoat = await boatsCollection.findOne({ _id: new ObjectId(id) })
    res.json({ success: true, data: updatedBoat })
  } catch (error) {
    console.error("Update boat error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete boat
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { db } = await connectToDatabase()
    const boatsCollection = db.collection(COLLECTIONS.BOATS)
    
    const result = await boatsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Boat not found" })
    }

    res.json({ success: true, message: "Boat deleted successfully" })
  } catch (error) {
    console.error("Delete boat error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router

