import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { HowItWorks } from "@/components/how-it-works"
import { Categories } from "@/components/categories"
import { Testimonials } from "@/components/testimonials"
import { CallToAction } from "@/components/call-to-action"

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
    </div>
  )
}
