import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Search, Calendar, CreditCard, ThumbsUp, ShieldCheck, HelpCircle } from "lucide-react"

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Search className="h-12 w-12 text-primary" />,
      title: "Find What You Need",
      description:
        "Browse our extensive catalog of items available for rent. Filter by category, location, and price to find exactly what you're looking for.",
    },
    {
      icon: <Calendar className="h-12 w-12 text-primary" />,
      title: "Book Your Rental",
      description:
        "Select your rental dates and submit a request to the owner. You'll receive a confirmation once the owner approves your request.",
    },
    {
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      title: "Secure Payment",
      description:
        "Pay securely through our platform with various payment options. Your payment is only released to the owner after you receive the item.",
    },
    {
      icon: <ThumbsUp className="h-12 w-12 text-primary" />,
      title: "Enjoy & Return",
      description:
        "Use the item during your rental period and return it to the owner when you're done. Leave feedback to help others make informed decisions.",
    },
  ]

  const benefits = [
    {
      title: "Save Money",
      description: "Rent items instead of buying them for one-time or occasional use.",
    },
    {
      title: "Earn Extra Income",
      description: "List your unused items and earn money by renting them out.",
    },
    {
      title: "Reduce Waste",
      description: "Contribute to a more sustainable future by sharing resources.",
    },
    {
      title: "Access Quality Items",
      description: "Rent high-quality items that might be too expensive to purchase.",
    },
  ]

  const faqs = [
    {
      question: "How do I list an item for rent?",
      answer:
        "Create an account, go to your dashboard, and click on 'Add Product'. Fill in the details about your item, set a price, and upload photos.",
    },
    {
      question: "What if an item is damaged during the rental period?",
      answer:
        "Renters are responsible for returning items in the same condition they received them. We recommend documenting the condition before and after the rental period.",
    },
    {
      question: "How do payments work?",
      answer:
        "Payments are processed securely through our platform. The renter pays when booking, and the payment is released to the owner after the rental period begins.",
    },
    {
      question: "Can I cancel a rental request?",
      answer:
        "Yes, both renters and owners can cancel a rental request. Cancellation policies vary depending on how close to the rental start date the cancellation occurs.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">How RentEase Works</h1>
        <p className="text-xl text-muted-foreground">
          RentEase connects people who want to rent items with those who have items to rent. Our platform makes it easy
          to find, book, and pay for rentals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {steps.map((step, index) => (
          <Card key={index} className="border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <div className="mb-4">{step.icon}</div>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted rounded-lg p-8 mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Use RentEase?</h2>
          <p className="text-muted-foreground">Our platform offers numerous benefits for both renters and owners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Find answers to common questions about using RentEase.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8 text-primary-foreground/90">
          Join thousands of users who are already saving money and earning extra income through RentEase.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Create an Account</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/20 hover:bg-primary-foreground/10"
            asChild
          >
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Secure & Trusted Platform</h3>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          RentEase prioritizes the safety and security of our users. We verify user identities, secure payments, and
          provide support throughout the rental process.
        </p>
      </div>
    </div>
  )
}
