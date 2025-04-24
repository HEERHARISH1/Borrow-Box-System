export interface User {
  id: number
  username: string
  email: string
  role: "USER" | "OWNER" | "ADMIN"
  is_verified: boolean
}

export interface Product {
  product_id: number
  name: string
  description: string
  price: number
  category: string
  owner_id: number
  availibility: number
  owner?: User
}

export interface Rental {
  rental_id: number
  product_id: number
  renter_id: number
  start_date: string
  end_date: string
  status: "Pending" | "Approved" | "Declined" | "Returned"
  product?: Product
  renter?: User
}

export interface Feedback {
  Feedback_id: number
  product_id: number
  rating: number
  comment: string
  product?: Product
}
