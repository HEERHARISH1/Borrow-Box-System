import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Rent Anything, <span className="text-primary">Anytime</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Find the perfect item for your needs or earn money by renting out your unused items.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Products
                </Button>
              </Link>
              <Link href="/list-product">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  List Your Item
                </Button>
              </Link>
            </div>
            <div className="relative mt-8">
              <div className="flex items-center border border-input rounded-lg overflow-hidden">
                <div className="pl-4">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="w-full py-3 px-4 focus:outline-none bg-transparent"
                />
                <Button className="rounded-none h-full">Search</Button>
              </div>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-lg font-medium">Hero Image Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
