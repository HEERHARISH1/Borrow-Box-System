"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { getRentals, updateRentalStatus } from "@/lib/data"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Calendar, Clock } from "lucide-react"

export default function RentalsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [rentals, setRentals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const loadRentals = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const userRentals = await getRentals(user.id, user.role === "OWNER" || user.role === "ADMIN")
        setRentals(userRentals)
      } catch (error) {
        console.error("Failed to load rentals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRentals()
  }, [user])

  const handleStatusUpdate = async (rentalId: number, status: string) => {
    if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) return

    try {
      await updateRentalStatus(rentalId, status as any, user.id)

      // Update local state
      setRentals((prevRentals) =>
        prevRentals.map((rental) => (rental.rental_id === rentalId ? { ...rental, status } : rental)),
      )
    } catch (error) {
      console.error("Failed to update rental status:", error)
    }
  }

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  const isOwner = user.role === "OWNER" || user.role === "ADMIN"

  const pendingRentals = rentals.filter((rental) => rental.status === "Pending")
  const activeRentals = rentals.filter((rental) => rental.status === "Approved")
  const completedRentals = rentals.filter((rental) => rental.status === "Returned" || rental.status === "Declined")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <DashboardSidebar />

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{isOwner ? "Rental Requests" : "My Rentals"}</h1>
            <p className="text-muted-foreground">
              {isOwner ? "Manage rental requests for your products" : "Track your product rental history"}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rentals.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">No Rentals Found</h3>
                <p className="text-muted-foreground mb-4">
                  {isOwner ? "You haven't received any rental requests yet." : "You haven't rented any products yet."}
                </p>
                <Button asChild>
                  <Link href={isOwner ? "/dashboard/products" : "/products"}>
                    {isOwner ? "Manage Your Products" : "Browse Products"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All ({rentals.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingRentals.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeRentals.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedRentals.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 pt-4">
                <RentalList rentals={rentals} isOwner={isOwner} handleStatusUpdate={handleStatusUpdate} />
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 pt-4">
                <RentalList rentals={pendingRentals} isOwner={isOwner} handleStatusUpdate={handleStatusUpdate} />
              </TabsContent>

              <TabsContent value="active" className="space-y-4 pt-4">
                <RentalList rentals={activeRentals} isOwner={isOwner} handleStatusUpdate={handleStatusUpdate} />
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 pt-4">
                <RentalList rentals={completedRentals} isOwner={isOwner} handleStatusUpdate={handleStatusUpdate} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}

function RentalList({
  rentals,
  isOwner,
  handleStatusUpdate,
}: {
  rentals: any[]
  isOwner: boolean
  handleStatusUpdate: (rentalId: number, status: string) => void
}) {
  return (
    <div className="space-y-4">
      {rentals.map((rental) => (
        <Card key={rental.rental_id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{rental.product_name}</h3>
                  <StatusBadge status={rental.status} />
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {calculateDuration(rental.start_date, rental.end_date)} days
                </div>
                <p className="text-sm">
                  {isOwner ? (
                    <>
                      Renter: <span className="font-medium">{rental.renter_name}</span>
                    </>
                  ) : (
                    <>
                      Total:{" "}
                      <span className="font-medium">
                        ${calculateTotal(rental.price, rental.start_date, rental.end_date).toFixed(2)}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {isOwner && rental.status === "Pending" && (
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={() => handleStatusUpdate(rental.rental_id, "Approved")}>
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(rental.rental_id, "Declined")}>
                    Decline
                  </Button>
                </div>
              )}

              {isOwner && rental.status === "Approved" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(rental.rental_id, "Returned")}>
                  Mark as Returned
                </Button>
              )}

              {!isOwner && rental.status === "Approved" && (
                <Link href={`/products/${rental.product_id}`}>
                  <Button variant="outline" size="sm">
                    View Product
                  </Button>
                </Link>
              )}

              {!isOwner && rental.status === "Returned" && !rental.has_feedback && (
                <Link href={`/feedback/${rental.product_id}`}>
                  <Button variant="outline" size="sm">
                    Leave Feedback
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "outline" | "secondary" | "destructive" = "default"

  switch (status) {
    case "Approved":
      variant = "default"
      break
    case "Pending":
      variant = "secondary"
      break
    case "Declined":
      variant = "destructive"
      break
    case "Returned":
      variant = "outline"
      break
  }

  return <Badge variant={variant}>{status}</Badge>
}

function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function calculateTotal(pricePerDay: number, startDate: string, endDate: string): number {
  const days = calculateDuration(startDate, endDate)
  return days * pricePerDay
}
