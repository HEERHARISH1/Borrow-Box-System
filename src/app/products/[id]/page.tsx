"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/hooks/use-auth"
import { getProductById, getProductFeedback, createRental } from "@/lib/data"
import type { Feedback } from "@/lib/types"
import { Star } from "lucide-react"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [dateError, setDateError] = useState("")

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true)
        const productId = Number(params.id)
        const productData = await getProductById(productId)
        setProduct(productData)

        const feedbackData = await getProductFeedback(productId)
        setFeedback(feedbackData)
      } catch (error) {
        console.error("Failed to load product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  const handleDateSelect = (date: Date | undefined) => {
    setDateError("")
    if (!startDate) {
      setStartDate(date)
    } else if (!endDate && date && date > startDate) {
      setEndDate(date)
    } else {
      setStartDate(date)
      setEndDate(undefined)
    }
  }

  const handleRentNow = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!startDate || !endDate) {
      setDateError("Please select both start and end dates")
      return
    }

    try {
      await createRental({
        product_id: product.product_id,
        renter_id: user.id,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        status: "Pending",
      })

      router.push("/dashboard/rentals")
    } catch (error) {
      console.error("Failed to create rental:", error)
      setDateError("Failed to create rental. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Button className="mt-4" onClick={() => router.push("/products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  const isOwner = user && user.id === product.owner_id
  const totalDays =
    startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const totalPrice = totalDays * product.price

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-lg font-medium">Product Image</p>
            </div>
            <Badge className="absolute top-4 left-4">{product.category}</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm">Image {i}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-xl text-primary font-semibold mt-2">${product.price.toFixed(2)}/day</p>
            <Badge variant="outline" className="mt-2">
              {product.availibility ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-2">Owner</h2>
            <p>{product.owner_name || "Unknown"}</p>
          </div>

          {!isOwner && product.availibility ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Rent this product</h3>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Select rental dates:</p>
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: startDate,
                      to: endDate,
                    }}
                    onSelect={(range) => {
                      setStartDate(range?.from)
                      setEndDate(range?.to)
                      setDateError("")
                    }}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                  {dateError && <p className="text-destructive text-sm mt-2">{dateError}</p>}
                </div>

                {startDate && endDate && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Price per day:</span>
                      <span>${product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of days:</span>
                      <span>{totalDays}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 p-6">
                <Button className="w-full" onClick={handleRentNow}>
                  {user ? "Rent Now" : "Login to Rent"}
                </Button>
              </CardFooter>
            </Card>
          ) : isOwner ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">You own this product</h3>
                <p className="text-muted-foreground">You can manage this product from your dashboard.</p>
              </CardContent>
              <CardFooter className="bg-muted/50 p-6">
                <Button className="w-full" onClick={() => router.push("/dashboard/products")}>
                  Manage Product
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Product Unavailable</h3>
                <p className="text-muted-foreground">This product is currently unavailable for rent.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="reviews">
          <TabsList>
            <TabsTrigger value="reviews">Reviews ({feedback.length})</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="pt-4">
            {feedback.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet for this product.</p>
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.Feedback_id} className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= item.rating ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p>{item.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="details" className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Category</h3>
                  <p>{product.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Availability</h3>
                  <p>{product.availibility ? "Available" : "Unavailable"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold">Rental Terms</h3>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>Security deposit may be required</li>
                  <li>Return the item in the same condition</li>
                  <li>Late returns will incur additional charges</li>
                  <li>Cancellations must be made 24 hours in advance</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
