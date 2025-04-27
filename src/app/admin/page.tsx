"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, UserX, Package, BarChart3 } from "lucide-react"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("users")
  const [userToDelete, setUserToDelete] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalRentals: 0,
    totalRevenue: 0,
    activeRentals: 0,
  })

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (!userDoc.exists() || !userDoc.data().isAdmin) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have permission to access the admin panel.",
          })
          router.push("/")
          return
        }

        fetchData()
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/")
      }
    }

    checkAdmin()
  }, [user, router, toast])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch users
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))
      const usersSnapshot = await getDocs(usersQuery)
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUsers(usersData)

      // Fetch products
      const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"))
      const productsSnapshot = await getDocs(productsQuery)
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setProducts(productsData)

      // Fetch rentals
      const rentalsQuery = query(collection(db, "rentals"), orderBy("createdAt", "desc"))
      const rentalsSnapshot = await getDocs(rentalsQuery)
      const rentalsData = rentalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setRentals(rentalsData)

      // Calculate stats
      const activeRentals = rentalsData.filter((rental) => rental.status === "approved").length
      const totalRevenue = rentalsData
        .filter((rental) => rental.status === "completed")
        .reduce((sum, rental) => sum + (rental.totalPrice || 0), 0)

      setStats({
        totalUsers: usersData.length,
        totalProducts: productsData.length,
        totalRentals: rentalsData.length,
        totalRevenue,
        activeRentals,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data.",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async () => {
    if (!userToDelete) return

    try {
      // Delete user document
      await deleteDoc(doc(db, "users", userToDelete))

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete))

      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      })

      setUserToDelete(null)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      })
    }
  }

  const deleteProduct = async () => {
    if (!productToDelete) return

    try {
      // Delete product document
      await deleteDoc(doc(db, "products", productToDelete))

      // Update local state
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productToDelete))

      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted.",
      })

      setProductToDelete(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product.",
      })
    }
  }

  const makeAdmin = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isAdmin: true,
      })

      // Update local state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, isAdmin: true } : user)))

      toast({
        title: "Admin rights granted",
        description: "User has been granted admin rights.",
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user.",
      })
    }
  }

  const removeAdmin = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isAdmin: false,
      })

      // Update local state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, isAdmin: false } : user)))

      toast({
        title: "Admin rights removed",
        description: "User's admin rights have been removed.",
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user.",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeRentals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="rentals">Rentals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid gap-6">
            {users.map((userData) => (
              <Card key={userData.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{userData.name}</CardTitle>
                      <CardDescription>{userData.email}</CardDescription>
                    </div>
                    {userData.isAdmin && <Badge className="bg-primary">Admin</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="text-sm text-gray-500">
                      Joined: {userData.createdAt ? formatDate(new Date(userData.createdAt)) : "Unknown"}
                    </div>
                    {userData.location && <div className="text-sm text-gray-500">Location: {userData.location}</div>}
                    {userData.phone && <div className="text-sm text-gray-500">Phone: {userData.phone}</div>}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    {!userData.isAdmin ? (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => makeAdmin(userData.id)}>
                        Make Admin
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => removeAdmin(userData.id)}>
                        Remove Admin
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => setUserToDelete(userData.id)}
                        >
                          <UserX className="h-4 w-4 mr-1" /> Delete User
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account and all
                            associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteUser}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{product.title}</CardTitle>
                      <CardDescription>
                        {product.category} • Listed by {product.ownerName}
                      </CardDescription>
                    </div>
                    {product.isRented ? (
                      <Badge className="bg-yellow-500">Rented</Badge>
                    ) : (
                      <Badge className="bg-green-500">Available</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="text-sm text-gray-700 line-clamp-2">{product.description}</div>
                    <div className="font-medium">{formatCurrency(product.price)} / day</div>
                    <div className="text-sm text-gray-500">
                      Listed: {product.createdAt?.toDate ? formatDate(product.createdAt.toDate()) : "Recently"}
                    </div>
                    {product.location && <div className="text-sm text-gray-500">Location: {product.location}</div>}
                    <div className="text-sm text-gray-500">
                      Total Rentals: {product.totalRentals || 0} • Revenue: {formatCurrency(product.totalRevenue || 0)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer">
                        View Product
                      </a>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => setProductToDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete Product
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product and all associated
                            data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteProduct}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rentals">
          <div className="grid gap-6">
            {rentals.map((rental) => (
              <Card key={rental.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{rental.productTitle}</CardTitle>
                      <CardDescription>
                        Renter: {rental.renterName} • Owner: {rental.ownerName || "Unknown"}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`
                        ${rental.status === "pending" ? "bg-yellow-500" : ""}
                        ${rental.status === "approved" ? "bg-green-500" : ""}
                        ${rental.status === "rejected" ? "bg-red-500" : ""}
                        ${rental.status === "completed" ? "bg-blue-500" : ""}
                      `}
                    >
                      {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Rental Period:</span>
                      <span className="text-sm">
                        {formatDate(new Date(rental.startDate))} - {formatDate(new Date(rental.endDate))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Duration:</span>
                      <span className="text-sm">{rental.days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Price:</span>
                      <span className="text-sm font-medium">{formatCurrency(rental.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-sm">
                        {rental.createdAt?.toDate ? formatDate(rental.createdAt.toDate()) : "Recently"}
                      </span>
                    </div>
                    {rental.message && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                        <p className="font-medium mb-1">Message:</p>
                        <p>{rental.message}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={`/products/${rental.productId}`} target="_blank" rel="noopener noreferrer">
                      View Product
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-8">
            {/* Revenue by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Total revenue breakdown by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    products.reduce((acc, product) => {
                      const category = product.category || "Uncategorized"
                      acc[category] = (acc[category] || 0) + (product.totalRevenue || 0)
                      return acc
                    }, {}),
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, revenue]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 mr-2 text-primary" />
                          <span>{category}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(revenue)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Products with the highest rental count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products
                    .sort((a, b) => (b.totalRentals || 0) - (a.totalRentals || 0))
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{product.totalRentals || 0} rentals</div>
                          <div className="text-sm text-gray-500">{formatCurrency(product.totalRevenue || 0)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue breakdown by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    rentals
                      .filter((rental) => rental.status === "completed")
                      .reduce((acc, rental) => {
                        const date = rental.createdAt?.toDate ? rental.createdAt.toDate() : new Date()
                        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
                        acc[monthYear] = (acc[monthYear] || 0) + (rental.totalPrice || 0)
                        return acc
                      }, {}),
                  )
                    .sort((a, b) => {
                      const [aMonth, aYear] = a[0].split("/").map(Number)
                      const [bMonth, bYear] = b[0].split("/").map(Number)
                      return bYear - aYear || bMonth - aMonth
                    })
                    .map(([monthYear, revenue]) => (
                      <div key={monthYear} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                          <span>{monthYear}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(revenue)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
