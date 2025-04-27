import Hero from "@/components/hero"
import FeaturedProducts from "@/components/featured-products"
import HowItWorks from "@/components/how-it-works"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <Hero />
      <FeaturedProducts />
      <HowItWorks />

      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start borrowing or lending?</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Join our community today and start renting products or listing your own items for others to rent.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Create Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
