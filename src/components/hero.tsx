import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Rent What You Need, Share What You Don&apos;t</h1>
          <p className="text-xl text-gray-600 mb-8">
            Borrow Box connects people who need items with those who have them. Save money, reduce waste, and build
            community.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/products">Find Products</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/products/new">List Your Item</Link>
            </Button>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-8 aspect-square flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Package className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Peer-to-Peer Rentals</h2>
            <p className="text-gray-600">Access thousands of items in your community without having to buy them.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Package } from "lucide-react"
