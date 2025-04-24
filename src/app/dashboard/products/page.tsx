"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/use-auth"
import { getUserProducts, updateProduct, deleteProduct } from "@/lib/data"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MoreHorizontal, Plus, Edit, Trash2, Eye } from "lucide-react"
import type { Product } from "@/lib/types"

export default function ProductsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const loadProducts = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const userProducts = await getUserProducts(user.id)
        setProducts(userProducts)
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [user])

  const toggleAvailability = async (product: Product) => {
    try {
      const updatedProduct = {
        ...product,
        availibility: product.availibility ? 0 : 1,
      }

      await updateProduct(updatedProduct)

      // Update local state
      setProducts((prevProducts) => prevProducts.map((p) => (p.product_id === product.product_id ? updatedProduct : p)))
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!user) return

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      await deleteProduct(productId, user.id)

      // Update local state
      setProducts((prevProducts) => prevProducts.filter((p) => p.product_id !== productId))
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  const availableProducts = products.filter((product) => product.availibility === 1)
  const unavailableProducts = products.filter((product) => product.availibility === 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <DashboardSidebar />

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Products</h1>
              <p className="text-muted-foreground">Manage your products available for rent</p>
            </div>
            <Button asChild>
              <Link href="/list-product">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
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
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">No Products Listed</h3>
                <p className="text-muted-foreground mb-4">You haven't listed any products for rent yet.</p>
                <Button asChild>
                  <Link href="/list-product">List Your First Product</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Products ({products.length})</TabsTrigger>
                <TabsTrigger value="available">Available ({availableProducts.length})</TabsTrigger>
                <TabsTrigger value="unavailable">Unavailable ({unavailableProducts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 pt-4">
                <ProductList
                  products={products}
                  toggleAvailability={toggleAvailability}
                  handleDeleteProduct={handleDeleteProduct}
                />
              </TabsContent>

              <TabsContent value="available" className="space-y-4 pt-4">
                <ProductList
                  products={availableProducts}
                  toggleAvailability={toggleAvailability}
                  handleDeleteProduct={handleDeleteProduct}
                />
              </TabsContent>

              <TabsContent value="unavailable" className="space-y-4 pt-4">
                <ProductList
                  products={unavailableProducts}
                  toggleAvailability={toggleAvailability}
                  handleDeleteProduct={handleDeleteProduct}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductList({
  products,
  toggleAvailability,
  handleDeleteProduct,
}: {
  products: Product[]
  toggleAvailability: (product: Product) => void
  handleDeleteProduct: (productId: number) => void
}) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.product_id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <Badge variant={product.availibility ? "default" : "outline"}>
                    {product.availibility ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <p className="text-muted-foreground line-clamp-1">{product.description}</p>
                <p className="font-medium">${product.price.toFixed(2)}/day</p>
                <p className="text-sm text-muted-foreground">Category: {product.category}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/products/${product.product_id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/products/edit/${product.product_id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleAvailability(product)}>
                    {product.availibility ? (
                      <>
                        <span className="h-4 w-4 mr-2">🔒</span>
                        Mark as Unavailable
                      </>
                    ) : (
                      <>
                        <span className="h-4 w-4 mr-2">🔓</span>
                        Mark as Available
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteProduct(product.product_id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
