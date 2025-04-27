import { Search, Calendar, Package, Star } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Find What You Need",
      description: "Browse through thousands of items available for rent in your area.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Request to Rent",
      description: "Select your rental dates and send a request to the owner.",
    },
    {
      icon: <Package className="h-10 w-10 text-primary" />,
      title: "Get Your Item",
      description: "Once approved, arrange pickup or delivery with the owner.",
    },
    {
      icon: <Star className="h-10 w-10 text-primary" />,
      title: "Return & Review",
      description: "Return the item on time and leave feedback about your experience.",
    },
  ]

  return (
    <section className="py-16 bg-gray-50 -mx-4 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
