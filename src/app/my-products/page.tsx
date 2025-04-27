"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/components/ui/use-toast"

export default function MyProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    fetchProducts()
  }, [user, router])

  const fetchProducts = async () => {
    if (!user) return

    setLoading(true)
    try {
      const q = query(collection(db, "products"), where("ownerId", "==", user.uid))

      const querySnapshot = await getDocs(q)
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your products.",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (productId, currentStatus) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        available: !currentStatus,
      })

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.id === productId ? { ...product, available: !currentStatus } : product)),
      )

      toast({
        title: "Product updated",
        description: `Product is now ${!currentStatus ? "available" : "unavailable"} for rent.`,
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product availability.",
      })
    }
  }

  const deleteProduct = async () => {
    if (!productToDelete) return

    try {
      await deleteDoc(doc(db, "products", productToDelete))

      // Update local state
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productToDelete))

      toast({
        title: "Product deleted",
        description: "Your product has been successfully deleted.",
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Products</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" /> List New Product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No products listed yet</h2>
          <p className="text-gray-500 mb-6">Start earning by listing items you don&apos;t use every day.</p>
          <Button asChild>
            <Link href="/products/new">List Your First Product</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="truncate">{product.title}</CardTitle>
                <CardDescription>
                  {product.category} • Listed{" "}
                  {product.createdAt?.toDate ? formatDate(product.createdAt.toDate()) : "Recently"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-3 mb-4">{product.description}</p>
                <p className="font-medium text-primary mb-1">{formatCurrency(product.price)} / day</p>
                <p className="text-sm">
                  Status:{" "}
                  <span className={`font-medium ${product.available ? "text-green-600" : "text-red-600"}`}>
                    {product.available ? "Available" : "Unavailable"}
                  </span>
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleAvailability(product.id, product.available)}
                  >
                    {product.available ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/products/${product.id}`}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Link>
                  </Button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => setProductToDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your product and remove it from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteProduct}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
