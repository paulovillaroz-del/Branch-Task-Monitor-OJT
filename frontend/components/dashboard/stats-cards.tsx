"use client"

import { ArrowUpRight, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState } from "react"

const stats = [
  { title: "Total Tasks", value: "0", increase: "", subtitle: undefined, bgColor: "bg-card", textColor: "text-foreground", delay: "0ms" },
  { title: "Pending", value: "0", increase: "", subtitle: undefined, bgColor: "bg-amber-50", textColor: "text-amber-700", delay: "100ms" },
  { title: "In Progress", value: "0", increase: "", subtitle: undefined, bgColor: "bg-blue-50", textColor: "text-blue-700", delay: "200ms" },
  { title: "Completed", value: "0", increase: "", subtitle: undefined, bgColor: "bg-emerald-50", textColor: "text-emerald-700", delay: "300ms" },
  { title: "Overdue", value: "0", increase: "", subtitle: undefined, bgColor: "bg-red-50", textColor: "text-red-700", delay: "400ms" },
]

export function StatsCards() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{ animationDelay: stat.delay }}
          className={`${stat.bgColor} ${stat.textColor} p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer ${
            hoveredCard === index ? "scale-105 shadow-2xl" : "shadow-lg"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
            <div
              className={`w-6 h-6 rounded-full ${
                stat.bgColor === "bg-primary" ? "bg-primary-foreground/20" : "bg-primary"
              } flex items-center justify-center transition-transform duration-300 ${
                hoveredCard === index ? "rotate-45" : ""
              }`}
            >
              <ArrowUpRight
                className={`w-3 h-3 ${stat.bgColor === "bg-primary" ? "text-primary-foreground" : "text-primary-foreground"}`}
              />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">{stat.value}</p>
          <div className="flex items-center gap-1.5 text-xs opacity-80">
            {stat.increase && (
              <>
                <TrendingUp className="w-3 h-3" />
                <span>{stat.increase}</span>
              </>
            )}
            {stat.subtitle && <span>{stat.subtitle}</span>}
          </div>
        </Card>
      ))}
    </div>
  )
}
