// TypeScript types for the boat rental system

export interface User {
  _id?: string
  email: string
  password: string
  companyName: string
  companyId: string
  role: "admin" | "staff" | "customer"
  createdAt: Date
  updatedAt: Date
}

export interface Boat {
  _id?: string
  companyId: string
  name: string
  type: string
  capacity: number
  price: number
  location: string
  status: "available" | "rented" | "maintenance"
  features: string[]
  image: string
  rating: number
  reviews: number
  bookings: number
  revenue: number
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  _id?: string
  boatId: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startDate: Date
  endDate: Date
  guests: number
  totalPrice: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  _id?: string
  bookingId: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  paymentMethod: string
  transactionId: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id?: string
  boatId: string
  customerId: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface CompanyProfile {
  _id?: string
  companyId: string
  companyName: string
  description: string
  about: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  website: string
  operatingHours: {
    monday: { open: string; close: string; closed?: boolean }
    tuesday: { open: string; close: string; closed?: boolean }
    wednesday: { open: string; close: string; closed?: boolean }
    thursday: { open: string; close: string; closed?: boolean }
    friday: { open: string; close: string; closed?: boolean }
    saturday: { open: string; close: string; closed?: boolean }
    sunday: { open: string; close: string; closed?: boolean }
  }
  services: string[]
  location: {
    marina: string
    coordinates?: { lat: number; lng: number }
    directions: string
  }
  policies: {
    booking: string
    cancellation: string
    refund: string
  }
  safetyMeasures: string[]
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
  photos: string[]
  createdAt: Date
  updatedAt: Date
}


