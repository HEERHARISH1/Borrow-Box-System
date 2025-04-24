import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Renter",
      content:
        "I needed a camera for a weekend trip and found exactly what I was looking for on RentEase. The process was smooth and the owner was very helpful.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Owner",
      content:
        "I've been renting out my tools on RentEase for 6 months now and it's been a great way to earn extra income from items I don't use every day.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Renter",
      content:
        "Rented a bike for a week and saved so much money compared to buying one. The quality was excellent and the owner provided great service.",
      rating: 4,
    },
  ]

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">What Our Users Say</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Don't just take our word for it. Here's what our community has to say about their RentEase experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-muted p-6 rounded-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="mb-6">"{testimonial.content}"</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-secondary rounded-full mr-3 flex items-center justify-center">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold">{testimonial.name}</h4>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
