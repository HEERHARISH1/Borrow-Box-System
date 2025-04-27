"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { MapPin, User, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rentalDays, setRentalDays] = useState(1)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() })
        } else {
          toast({
            variant: "destructive",
            title: "Product not found",
            description: "The product you're looking for doesn't exist.",
          })
          router.push("/products")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details.",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), where("productId", "==", id), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const reviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setReviews(reviewsData)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoadingReviews(false)
      }
    }

    if (id) {
      fetchProduct()
      fetchReviews()
    }
  }, [id, router, toast])

  const handleRentRequest = async (e) => {
    e.preventDefault()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to request a rental.",
      })
      router.push("/auth/login")
      return
    }

    if (user.uid === product.ownerId) {
      toast({
        variant: "destructive",
        title: "Cannot rent your own product",
        description: "You cannot rent a product that you own.",
      })
      return
    }

    if (product.isRented) {
      toast({
        variant: "destructive",
        title: "Product unavailable",
        description: "This product is currently rented by someone else.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate rental details
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + Number.parseInt(rentalDays))

      const totalPrice = product.price * Number.parseInt(rentalDays)

      // Create rental request in Firestore
      await addDoc(collection(db, "rentals"), {
        productId: id,
        productTitle: product.title,
        ownerId: product.ownerId,
        renterId: user.uid,
        renterName: user.displayName || user.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: Number.parseInt(rentalDays),
        totalPrice,
        message,
        status: "pending", // pending, approved, rejected, completed
        createdAt: serverTimestamp(),
        reviewed: false,
      })

      toast({
        title: "Rental requested!",
        description: "Your rental request has been sent to the owner.",
      })

      setIsDialogOpen(false)
      router.push("/my-rentals")
    } catch (error) {
      console.error("Error creating rental request:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit rental request. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((total, review) => total + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />

          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-80 w-full rounded-lg" />

            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <p className="text-gray-500 mb-8">
          {product.category} • Listed {product.createdAt?.toDate ? formatDate(product.createdAt.toDate()) : "Recently"}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
            <div className="text-6xl text-gray-400">📦</div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="flex items-center text-gray-600">
              <User className="h-5 w-5 mr-2" />
              <span>Listed by {product.ownerName}</span>
            </div>

            {product.location && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{product.location}</span>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(calculateAverageRating()) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {calculateAverageRating()} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            <div className="pt-4">
              <div className="text-2xl font-bold mb-2">
                {formatCurrency(product.price)} <span className="text-gray-500 text-base font-normal">/ day</span>
              </div>

              {user && user.uid !== product.ownerId ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={product.isRented}>
                      {product.isRented ? "Currently Rented" : "Request to Rent"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rent {product.title}</DialogTitle>
                      <DialogDescription>Fill out the details to request this item for rental.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRentRequest} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="days">Number of Days</Label>
                        <Input
                          id="days"
                          type="number"
                          min="1"
                          value={rentalDays}
                          onChange={(e) => setRentalDays(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message to Owner (Optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Introduce yourself and explain why you need this item..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span>Daily Rate:</span>
                          <span>{formatCurrency(product.price)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Number of Days:</span>
                          <span>{rentalDays}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(product.price * rentalDays)}</span>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : user && user.uid === product.ownerId ? (
                <Button variant="outline" asChild>
                  <a href="/my-products">Manage Your Products</a>
                </Button>
              ) : (
                <Button asChild>
                  <a href="/auth/login">Log in to Rent</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>

          {loadingReviews ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{review.reviewerName}</h3>
                      <p className="text-sm text-gray-500">
                        {review.createdAt?.toDate ? formatDate(review.createdAt.toDate()) : "Recently"}
                      </p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-700">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet for this product.</p>
          )}
        </div>
      </div>
    </div>
  )
}
