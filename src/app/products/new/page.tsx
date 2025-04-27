"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODUCT_CATEGORIES } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function NewProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    location: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to list a product.",
      })
      router.push("/auth/login")
      return
    }

    // Validate form fields
    if (
      !formData.title || 
      !formData.description || 
      !formData.category || 
      !formData.price || 
      !formData.location
    ) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Title validation (5 to 20 characters)
    if (formData.title.length < 5 || formData.title.length > 20) {
      toast({
        variant: "destructive",
        title: "Invalid Title",
        description: "Title must be between 5 and 20 characters long.",
      })
      return
    }

    // Description validation (1 to 50 characters)
    if (formData.description.length < 1 || formData.description.length > 50) {
      toast({
        variant: "destructive",
        title: "Invalid Description",
        description: "Description must be between 1 and 50 characters long.",
      })
      return
    }

    // Price validation (1 to 100,000)
    const priceValue = Number.parseFloat(formData.price)
    if (isNaN(priceValue) || priceValue < 1 || priceValue > 100000) {
      toast({
        variant: "destructive",
        title: "Invalid Price",
        description: "Price must be between 1 and 100,000.",
      })
      return
    }

    setLoading(true)

    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: priceValue,
        location: formData.location,
        ownerId: user.uid,
        ownerName: user.displayName || user.name,
        createdAt: serverTimestamp(),
        available: true,
        isRented: false,
        totalRentals: 0,
        totalRevenue: 0,
      }

      const docRef = await addDoc(collection(db, "products"), productData)

      toast({
        title: "Product listed!",
        description: "Your product has been successfully listed for rent.",
      })

      router.push(`/products/${docRef.id}`)
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to list your product. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">List Your Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Product Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Professional DSLR Camera"
            minLength={5}
            maxLength={20}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your product..."
            rows={5}
            minLength={1}
            maxLength={50}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Daily Rental Price (USD) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={1}
            max={100000}
            step="1"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., New York, NY"
            required
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Listing Product..." : "List Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
