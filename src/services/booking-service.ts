// Business logic for booking operations

import type { Booking } from "../lib/types.js"
import { isBoatAvailable, calculateRentalPrice } from "./availability.js"

export interface CreateBookingInput {
  boatId: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startDate: Date
  endDate: Date
  guests: number
  boatPrice: number
}

export interface BookingResponse {
  success: boolean
  data?: Booking
  error?: string
}

/**
 * Validate booking request
 */
export function validateBooking(input: CreateBookingInput): { valid: boolean; error?: string } {
  // Check dates
  const start = new Date(input.startDate)
  const end = new Date(input.endDate)

  if (start >= end) {
    return { valid: false, error: "End date must be after start date" }
  }

  // Check if start date is in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (start < today) {
    return { valid: false, error: "Start date cannot be in the past" }
  }

  // Check guest count
  if (input.guests < 1) {
    return { valid: false, error: "At least one guest is required" }
  }

  // Check contact info
  if (!input.customerName || !input.customerEmail || !input.customerPhone) {
    return { valid: false, error: "Customer information is required" }
  }

  return { valid: true }
}

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput, existingBookings: Booking[]): Promise<BookingResponse> {
  // Validate input
  const validation = validateBooking(input)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Check availability
  if (!isBoatAvailable(input.boatId, input.startDate, input.endDate, existingBookings)) {
    return { success: false, error: "Boat is not available for the selected dates" }
  }

  // Calculate total price
  const totalPrice = calculateRentalPrice(input.boatPrice, input.startDate, input.endDate)

  // Create booking object
  const booking: Booking = {
    boatId: input.boatId,
    customerId: input.customerId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    guests: input.guests,
    totalPrice,
    status: "pending",
    paymentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return { success: true, data: booking }
}

/**
 * Cancel a booking
 */
export function cancelBooking(booking: Booking): BookingResponse {
  if (booking.status === "completed") {
    return { success: false, error: "Cannot cancel a completed booking" }
  }

  if (booking.status === "cancelled") {
    return { success: false, error: "Booking is already cancelled" }
  }

  const updatedBooking = {
    ...booking,
    status: "cancelled" as const,
    updatedAt: new Date(),
  }

  return { success: true, data: updatedBooking }
}

/**
 * Complete a booking (when boat is returned)
 */
export function completeBooking(booking: Booking): BookingResponse {
  if (booking.status === "completed") {
    return { success: false, error: "Booking is already completed" }
  }

  if (booking.status === "cancelled") {
    return { success: false, error: "Cannot complete a cancelled booking" }
  }

  const updatedBooking = {
    ...booking,
    status: "completed" as const,
    updatedAt: new Date(),
  }

  return { success: true, data: updatedBooking }
}

/**
 * Get booking statistics for a boat
 */
export function getBoatBookingStats(boatId: string, bookings: Booking[]) {
  const boatBookings = bookings.filter((b) => b.boatId === boatId)

  const stats = {
    totalBookings: boatBookings.length,
    confirmedBookings: boatBookings.filter((b) => b.status === "confirmed").length,
    completedBookings: boatBookings.filter((b) => b.status === "completed").length,
    cancelledBookings: boatBookings.filter((b) => b.status === "cancelled").length,
    totalRevenue: boatBookings
      .filter((b) => b.status === "completed" || b.status === "confirmed")
      .reduce((sum, b) => sum + b.totalPrice, 0),
    utilizationRate:
      boatBookings.length > 0
        ? (boatBookings.filter((b) => b.status !== "cancelled").length / boatBookings.length) * 100
        : 0,
  }

  return stats
}


