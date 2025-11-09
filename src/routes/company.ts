import express from "express"
import { connectToDatabase, COLLECTIONS } from "../services/db.js"
import type { CompanyProfile } from "../lib/types.js"

const router = express.Router()

// Get company profile by companyId
router.get("/profile", async (req, res) => {
  try {
    const { companyId } = req.query

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      })
    }

    const { db } = await connectToDatabase()
    const profilesCollection = db.collection(COLLECTIONS.COMPANY_PROFILES)

    const profile = await profilesCollection.findOne({
      companyId: companyId as string,
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Company profile not found",
      })
    }

    res.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error("Get company profile error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Create or update company profile
router.post("/profile", async (req, res) => {
  try {
    const profileData: CompanyProfile = req.body

    if (!profileData.companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      })
    }

    const { db } = await connectToDatabase()
    const profilesCollection = db.collection(COLLECTIONS.COMPANY_PROFILES)

    const now = new Date()

    // Check if profile exists
    const existingProfile = await profilesCollection.findOne({
      companyId: profileData.companyId,
    })

    if (existingProfile) {
      // Update existing profile
      const updateData = {
        ...profileData,
        updatedAt: now,
      }

      const result = await profilesCollection.updateOne(
        { companyId: profileData.companyId },
        { $set: updateData },
      )

      const updatedProfile = await profilesCollection.findOne({
        companyId: profileData.companyId,
      })

      res.json({
        success: true,
        message: "Company profile updated successfully",
        data: updatedProfile,
      })
    } else {
      // Create new profile
      const newProfile: CompanyProfile = {
        ...profileData,
        createdAt: now,
        updatedAt: now,
      }

      const result = await profilesCollection.insertOne(newProfile)

      const createdProfile = await profilesCollection.findOne({
        _id: result.insertedId,
      })

      res.status(201).json({
        success: true,
        message: "Company profile created successfully",
        data: createdProfile,
      })
    }
  } catch (error) {
    console.error("Create/update company profile error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Update company profile (PUT method)
router.put("/profile/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params
    const updateData = req.body

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      })
    }

    const { db } = await connectToDatabase()
    const profilesCollection = db.collection(COLLECTIONS.COMPANY_PROFILES)

    const now = new Date()
    updateData.updatedAt = now

    const result = await profilesCollection.updateOne(
      { companyId },
      { $set: updateData },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Company profile not found",
      })
    }

    const updatedProfile = await profilesCollection.findOne({ companyId })

    res.json({
      success: true,
      message: "Company profile updated successfully",
      data: updatedProfile,
    })
  } catch (error) {
    console.error("Update company profile error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// Delete company profile
router.delete("/profile/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      })
    }

    const { db } = await connectToDatabase()
    const profilesCollection = db.collection(COLLECTIONS.COMPANY_PROFILES)

    const result = await profilesCollection.deleteOne({ companyId })

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Company profile not found",
      })
    }

    res.json({
      success: true,
      message: "Company profile deleted successfully",
    })
  } catch (error) {
    console.error("Delete company profile error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

export default router

