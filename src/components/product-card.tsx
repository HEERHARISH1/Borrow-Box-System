import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

export default function ProductCard({ product }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <div className="text-4xl text-gray-400">📦</div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.title}</h3>
        <p className="text-gray-500 text-sm mb-2">{product.category}</p>
        <p className="font-medium text-primary">{formatCurrency(product.price)} / day</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/products/${product.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
