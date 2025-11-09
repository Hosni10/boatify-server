import express from "express"
import bcrypt from "bcryptjs"
import { connectToDatabase, COLLECTIONS } from "../services/db.js"
import type { User } from "../lib/types.js"

const router = express.Router()

// Sign up
router.post("/signup", async (req, res) => {
  try {
    const { email, password, companyName, role = "customer" } = req.body

    if (!email || !password || !companyName) {
      return res.status(400).json({ error: "Email, password, and company name are required" })
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection(COLLECTIONS.USERS)

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate company ID
    const companyId = `company_${Date.now()}`

    // Create user
    const user: User = {
      email,
      password: hashedPassword,
      companyName,
      companyId,
      role: role as "admin" | "staff" | "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(user)

    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        email: user.email,
        companyName: user.companyName,
        companyId: user.companyId,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection(COLLECTIONS.USERS)

    // Find user
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        companyName: user.companyName,
        companyId: user.companyId,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router


