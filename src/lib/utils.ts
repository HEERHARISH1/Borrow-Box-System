import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Home & Garden",
  "Sports & Outdoors",
  "Tools & Equipment",
  "Vehicles",
  "Clothing & Accessories",
  "Toys & Games",
  "Books & Media",
  "Party & Events",
  "Other",
]
