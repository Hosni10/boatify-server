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


