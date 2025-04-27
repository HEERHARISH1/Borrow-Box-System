"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, Package, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Rating } from "@/components/rating"

export default function MyRentalsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [rentals, setRentals] = useState([])
  const [ownedRentals, setOwnedRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("renting")
  const [reviewData, setReviewData] = useState({
    rentalId: "",
    productId: "",
    rating: 0,
    comment: "",
  })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    fetchRentals()
  }, [user, router])

  const fetchRentals = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch rentals where user is the renter
      const renterQuery = query(collection(db, "rentals"), where("renterId", "==", user.uid))

      const renterSnapshot = await getDocs(renterQuery)
      const renterRentals = renterSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setRentals(renterRentals)

      // Fetch rentals where user is the owner
      const ownerQuery = query(collection(db, "rentals"), where("ownerId", "==", user.uid))

      const ownerSnapshot = await getDocs(ownerQuery)
      const ownerRentals = ownerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setOwnedRentals(ownerRentals)
    } catch (error) {
      console.error("Error fetching rentals:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your rentals.",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRentalStatus = async (rentalId, newStatus) => {
    try {
      const rentalRef = doc(db, "rentals", rentalId)
      const rentalSnap = await getDoc(rentalRef)

      if (!rentalSnap.exists()) {
        throw new Error("Rental not found")
      }

      const rentalData = rentalSnap.data()

      // Update rental status
      await updateDoc(rentalRef, {
        status: newStatus,
      })

      // If approved, mark the product as rented
      if (newStatus === "approved") {
        const productRef = doc(db, "products", rentalData.productId)
        await updateDoc(productRef, {
          isRented: true,
        })
      }

      // If completed, mark the product as available again and update stats
      if (newStatus === "completed") {
        const productRef = doc(db, "products", rentalData.productId)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
          const productData = productSnap.data()
          await updateDoc(productRef, {
            isRented: false,
            totalRentals: (productData.totalRentals || 0) + 1,
            totalRevenue: (productData.totalRevenue || 0) + rentalData.totalPrice,
          })
        }
      }

      // Update local state
      setOwnedRentals((prevRentals) =>
        prevRentals.map((rental) => (rental.id === rentalId ? { ...rental, status: newStatus } : rental)),
      )

      toast({
        title: "Rental updated",
        description: `Rental request ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating rental:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update rental status.",
      })
    }
  }

  const handleReviewSubmit = async () => {
    if (reviewData.rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating required",
        description: "Please select a rating before submitting.",
      })
      return
    }

    setIsSubmittingReview(true)

    try {
      // Add review to Firestore
      await addDoc(collection(db, "reviews"), {
        rentalId: reviewData.rentalId,
        productId: reviewData.productId,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: serverTimestamp(),
      })

      // Update rental to mark as reviewed
      await updateDoc(doc(db, "rentals", reviewData.rentalId), {
        reviewed: true,
      })

      // Update local state
      setRentals((prevRentals) =>
        prevRentals.map((rental) => (rental.id === reviewData.rentalId ? { ...rental, reviewed: true } : rental)),
      )

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      setIsReviewDialogOpen(false)
      setReviewData({
        rentalId: "",
        productId: "",
        rating: 0,
        comment: "",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit review. Please try again.",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const openReviewDialog = (rental) => {
    setReviewData({
      rentalId: rental.id,
      productId: rental.productId,
      rating: 0,
      comment: "",
    })
    setIsReviewDialogOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Rentals</h1>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Rentals</h1>

      <Tabs defaultValue="renting" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="renting">Items I'm Renting</TabsTrigger>
          <TabsTrigger value="lending">Rental Requests</TabsTrigger>
          <TabsTrigger value="history">Rental History</TabsTrigger>
        </TabsList>

        <TabsContent value="renting">
          {rentals.filter((rental) => rental.status === "pending" || rental.status === "approved").length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-medium mb-2">No active rentals</h2>
              <p className="text-gray-500 mb-6">
                You don&apos;t have any active rental requests. Browse products to find what you need.
              </p>
              <Button asChild>
                <a href="/products">Browse Products</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {rentals
                .filter((rental) => rental.status === "pending" || rental.status === "approved")
                .map((rental) => (
                  <Card key={rental.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="truncate">{rental.productTitle}</CardTitle>
                          <CardDescription>
                            Requested on {formatDate(rental.createdAt?.toDate() || new Date())}
                          </CardDescription>
                        </div>
                        {getStatusBadge(rental.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex items-center text-gray-600">
                          <Package className="h-4 w-4 mr-2" />
                          <span>Owner: {rental.ownerName || "Unknown"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {formatDate(new Date(rental.startDate))} - {formatDate(new Date(rental.endDate))}
                          </span>
                        </div>
                        <div className="font-medium">Total: {formatCurrency(rental.totalPrice)}</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`/products/${rental.productId}`}>View Product</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lending">
          {ownedRentals.filter((rental) => rental.status === "pending" || rental.status === "approved").length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-medium mb-2">No rental requests</h2>
              <p className="text-gray-500 mb-6">
                You don&apos;t have any active rental requests for your products yet.
              </p>
              <Button asChild>
                <a href="/my-products">Manage Your Products</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {ownedRentals
                .filter((rental) => rental.status === "pending" || rental.status === "approved")
                .map((rental) => (
                  <Card key={rental.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="truncate">{rental.productTitle}</CardTitle>
                          <CardDescription>
                            Requested by {rental.renterName} on {formatDate(rental.createdAt?.toDate() || new Date())}
                          </CardDescription>
                        </div>
                        {getStatusBadge(rental.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {formatDate(new Date(rental.startDate))} - {formatDate(new Date(rental.endDate))}
                          </span>
                        </div>
                        <div className="font-medium">Total: {formatCurrency(rental.totalPrice)}</div>
                        {rental.message && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                            <p className="font-medium mb-1">Message:</p>
                            <p>{rental.message}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {rental.status === "pending" && (
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => updateRentalStatus(rental.id, "rejected")}
                          >
                            Reject
                          </Button>
                          <Button className="flex-1" onClick={() => updateRentalStatus(rental.id, "approved")}>
                            Approve
                          </Button>
                        </div>
                      )}
                      {rental.status === "approved" && (
                        <Button className="w-full" onClick={() => updateRentalStatus(rental.id, "completed")}>
                          Mark as Completed
                        </Button>
                      )}
                      {(rental.status === "rejected" || rental.status === "completed") && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={`/products/${rental.productId}`}>View Product</a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {rentals.filter((rental) => rental.status === "completed" || rental.status === "rejected").length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-medium mb-2">No rental history</h2>
              <p className="text-gray-500 mb-6">You don&apos;t have any completed or rejected rentals yet.</p>
              <Button asChild>
                <a href="/products">Browse Products</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {rentals
                .filter((rental) => rental.status === "completed" || rental.status === "rejected")
                .map((rental) => (
                  <Card key={rental.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="truncate">{rental.productTitle}</CardTitle>
                          <CardDescription>
                            {rental.status === "completed" ? "Rented" : "Requested"} on{" "}
                            {formatDate(rental.createdAt?.toDate() || new Date())}
                          </CardDescription>
                        </div>
                        {getStatusBadge(rental.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex items-center text-gray-600">
                          <Package className="h-4 w-4 mr-2" />
                          <span>Owner: {rental.ownerName || "Unknown"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {formatDate(new Date(rental.startDate))} - {formatDate(new Date(rental.endDate))}
                          </span>
                        </div>
                        <div className="font-medium">Total: {formatCurrency(rental.totalPrice)}</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {rental.status === "completed" && !rental.reviewed && (
                        <Button className="w-full" onClick={() => openReviewDialog(rental)}>
                          <Star className="h-4 w-4 mr-2" />
                          Leave Review
                        </Button>
                      )}
                      {(rental.status === "completed" && rental.reviewed) || rental.status === "rejected" ? (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={`/products/${rental.productId}`}>View Product</a>
                        </Button>
                      ) : null}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>Share your experience with this product to help other renters.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center">
              <Rating
                value={reviewData.rating}
                onChange={(value) => setReviewData((prev) => ({ ...prev, rating: value }))}
              />
            </div>
            <Textarea
              placeholder="Share your experience with this product..."
              value={reviewData.comment}
              onChange={(e) => setReviewData((prev) => ({ ...prev, comment: e.target.value }))}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit} disabled={isSubmittingReview}>
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
