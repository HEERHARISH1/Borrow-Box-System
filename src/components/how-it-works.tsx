import { Search, Calendar, CreditCard, ThumbsUp } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Find What You Need",
      description: "Browse our extensive catalog of items available for rent in your area.",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Book Your Rental",
      description: "Select your rental dates and submit a request to the owner.",
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Secure Payment",
      description: "Pay securely through our platform with various payment options.",
    },
    {
      icon: <ThumbsUp className="h-8 w-8" />,
      title: "Enjoy & Return",
      description: "Use the item during your rental period and return it when you're done.",
    },
  ]

  return (
    <section className="bg-muted py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How RentEase Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Renting items has never been easier. Follow these simple steps to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
