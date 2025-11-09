// Availability checking and management logic

import type { Booking } from "../lib/types.js"

export interface AvailabilitySlot {
  date: Date
  available: boolean
  reason?: string
}

/**
 * Check if a boat is available for a specific date range
 * @param boatId - The boat ID to check
 * @param startDate - Start date of the rental
 * @param endDate - End date of the rental
 * @param bookings - Array of existing bookings
 * @returns true if boat is available, false otherwise
 */
export function isBoatAvailable(boatId: string, startDate: Date, endDate: Date, bookings: Booking[]): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Check for overlapping bookings
  const hasConflict = bookings.some((booking) => {
    // Only check confirmed and pending bookings
    if (booking.status === "cancelled" || booking.status === "completed") {
      return false
    }

    const bookingStart = new Date(booking.startDate)
    const bookingEnd = new Date(booking.endDate)

    // Check if date ranges overlap
    return booking.boatId === boatId && start < bookingEnd && end > bookingStart
  })

  return !hasConflict
}

/**
 * Get available boats for a specific date range
 * @param boats - Array of all boats
 * @param startDate - Start date of the rental
 * @param endDate - End date of the rental
 * @param bookings - Array of existing bookings
 * @returns Array of available boats
 */
export function getAvailableBoats(boats: any[], startDate: Date, endDate: Date, bookings: Booking[]): any[] {
  return boats.filter((boat) => isBoatAvailable(boat._id || boat.id, startDate, endDate, bookings))
}

/**
 * Get availability calendar for a boat
 * @param boatId - The boat ID
 * @param month - Month to check (0-11)
 * @param year - Year to check
 * @param bookings - Array of existing bookings
 * @returns Array of availability slots for each day
 */
export function getAvailabilityCalendar(
  boatId: string,
  month: number,
  year: number,
  bookings: Booking[],
): AvailabilitySlot[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const slots: AvailabilitySlot[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const nextDay = new Date(year, month, day + 1)

    const available = isBoatAvailable(boatId, date, nextDay, bookings)

    slots.push({
      date,
      available,
      reason: available ? undefined : "Boat is booked",
    })
  }

  return slots
}

/**
 * Calculate rental price based on boat price and number of days
 * @param pricePerDay - Price per day
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Total price
 */
export function calculateRentalPrice(pricePerDay: number, startDate: Date, endDate: Date): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return days * pricePerDay
}

/**
 * Get next available date for a boat
 * @param boatId - The boat ID
 * @param bookings - Array of existing bookings
 * @returns Next available date
 */
export function getNextAvailableDate(boatId: string, bookings: Booking[]): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get all bookings for this boat, sorted by end date
  const boatBookings = bookings
    .filter((b) => b.boatId === boatId && b.status !== "cancelled")
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())

  if (boatBookings.length === 0) {
    return today
  }

  // Return the day after the last booking ends
  const lastBooking = boatBookings[0]
  const nextDate = new Date(lastBooking.endDate)
  nextDate.setDate(nextDate.getDate() + 1)

  return nextDate > today ? nextDate : today
}


