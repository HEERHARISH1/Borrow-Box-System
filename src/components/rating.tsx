"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface RatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function Rating({ value, onChange, max = 5 }: RatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1
        return (
          <Star
            key={index}
            className={`h-8 w-8 cursor-pointer transition-all ${
              (hoverValue || value) >= starValue ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
          />
        )
      })}
    </div>
  )
}
