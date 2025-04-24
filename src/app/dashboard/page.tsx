"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/hooks/use-auth"
import { getUserProducts, getRentals } from "@/lib/data"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [rentals, setRentals] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Load user's products (if they're an owner)
        if (user.role === "OWNER" || user.role === "ADMIN") {
          const userProducts = await getUserProducts(user.id)
          setProducts(userProducts)
        }

        // Load user's rentals
        const userRentals = await getRentals(user.id, user.role === "OWNER")
        setRentals(userRentals)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <DashboardSidebar />

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.username}!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">My Products</CardTitle>
                <CardDescription>
                  {user.role === "OWNER" || user.role === "ADMIN"
                    ? "Products you've listed for rent"
                    : "You can list products as an owner"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {user.role === "OWNER" || user.role === "ADMIN" ? products.length : 0}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/products">
                    {user.role === "OWNER" || user.role === "ADMIN" ? "Manage Products" : "Become an Owner"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">My Rentals</CardTitle>
                <CardDescription>
                  {user.role === "OWNER" || user.role === "ADMIN"
                    ? "Rental requests for your products"
                    : "Products you've rented"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{rentals.length}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/rentals">Manage Rentals</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Role: <span className="font-semibold">{user.role}</span>
                </p>
                <p className="text-sm">
                  Status: <span className="font-semibold">{user.is_verified ? "Verified" : "Unverified"}</span>
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/settings">Settings</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="space-y-4 pt-4">
              {rentals.length > 0 ? (
                <div className="border rounded-lg divide-y">
                  {rentals.slice(0, 5).map((rental: any) => (
                    <div key={rental.rental_id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{rental.product_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(rental.start_date).toLocaleDateString()} -{" "}
                            {new Date(rental.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge status={rental.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent activity to display.</p>
              )}
              <Button variant="outline" asChild>
                <Link href="/dashboard/rentals">View All Activity</Link>
              </Button>
            </TabsContent>
            <TabsContent value="stats" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Statistics will be available after you have more activity on the platform.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function Badge({ status }: { status: string }) {
  let color
  switch (status) {
    case "Approved":
      color = "bg-green-100 text-green-800"
      break
    case "Pending":
      color = "bg-yellow-100 text-yellow-800"
      break
    case "Declined":
      color = "bg-red-100 text-red-800"
      break
    case "Returned":
      color = "bg-blue-100 text-blue-800"
      break
    default:
      color = "bg-gray-100 text-gray-800"
  }

  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>
}
