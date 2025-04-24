import Link from "next/link"
import { Camera, Bike, Shirt, Laptop, Wrench, Music, Book, Home } from "lucide-react"

export function Categories() {
  const categories = [
    { name: "Electronics", icon: <Camera className="h-6 w-6" />, href: "/products?category=Electronics" },
    { name: "Vehicles", icon: <Bike className="h-6 w-6" />, href: "/products?category=Vehicles" },
    { name: "Clothing", icon: <Shirt className="h-6 w-6" />, href: "/products?category=Clothing" },
    { name: "Computers", icon: <Laptop className="h-6 w-6" />, href: "/products?category=Computers" },
    { name: "Tools", icon: <Wrench className="h-6 w-6" />, href: "/products?category=Tools" },
    { name: "Instruments", icon: <Music className="h-6 w-6" />, href: "/products?category=Instruments" },
    { name: "Books", icon: <Book className="h-6 w-6" />, href: "/products?category=Books" },
    { name: "Home", icon: <Home className="h-6 w-6" />, href: "/products?category=Home" },
  ]

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">Browse by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:border-primary hover:bg-muted transition-colors"
          >
            <div className="p-3 bg-primary/10 rounded-full mb-3">{category.icon}</div>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
