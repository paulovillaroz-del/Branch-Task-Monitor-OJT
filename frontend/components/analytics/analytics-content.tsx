"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, CheckCircle, Clock, Target, ArrowUpRight, AlertCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

// Updated interface to include overdue
interface AnalyticsContentProps {
  stats: {
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
    total: number;
  }
}

export function AnalyticsContent({ stats }: AnalyticsContentProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // Map the live stats into the card format including Overdue
  const displayStats = [
    { title: "Total Tasks", value: stats.total, change: "+12%", trend: "up", icon: CheckCircle, color: "text-blue-600" },
    { title: "Pending", value: stats.pending, change: "-2%", trend: "down", icon: AlertCircle, color: "text-amber-600" },
    { title: "In Progress", value: stats.in_progress, change: "+2", trend: "up", icon: Target, color: "text-blue-500" },
    { title: "Completed", value: stats.completed, change: "+4", trend: "up", icon: CheckCircle, color: "text-emerald-600" },
    { title: "Overdue", value: stats.overdue, change: "Critical", trend: "down", icon: AlertTriangle, color: "text-red-600" },
  ]

  // Monthly data with dummy months preserved as requested
  const monthlyData = [
    { month: "Jan", tasks: 45 },
    { month: "Feb", tasks: 52 },
    { month: "Mar", tasks: 48 },
    { month: "Apr (Live)", tasks: stats.total }, 
  ]

  const maxTasks = Math.max(70, ...monthlyData.map((d) => d.tasks))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP ROW: LIVE STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {displayStats.map((stat, index) => (
          <Card
            key={stat.title}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`bg-card text-foreground p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer border-border/50 ${
              hoveredCard === index ? "scale-105 shadow-xl border-primary/20" : "shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/50 rounded-full">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-70">{stat.title}</h3>
              </div>
              <div
                className={`w-5 h-5 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 ${
                  hoveredCard === index ? "rotate-45" : ""
                }`}
              >
                <ArrowUpRight className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-black mb-2 tracking-tighter">
              {stat.value}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter">
              {stat.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={stat.trend === "up" ? "text-emerald-600" : "text-red-600"}>
                {stat.change} <span className="text-muted-foreground opacity-50 ml-1">Synced</span>
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. MONTHLY PERFORMANCE BARS */}
        <Card className="p-6 border-border/50 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Monthly Task Performance</h3>
          <div className="space-y-5">
            {monthlyData.map((data, index) => (
              <div
                key={data.month}
                className="space-y-2 animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-widest">{data.month}</span>
                  <span className="text-muted-foreground font-mono">{data.tasks} tasks</span>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    style={{ width: `${(data.tasks / maxTasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. TASK STATUS DISTRIBUTION (NOW SHOWING OVERDUE) */}
        <Card className="p-6 border-border/50 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Task Status Distribution</h3>
          <div className="space-y-3">
            {[
              { name: "In Progress", count: stats.in_progress, color: "bg-blue-500", border: "border-blue-200" },
              { name: "Completed", count: stats.completed, color: "bg-emerald-600", border: "border-emerald-200" },
              { name: "Pending", count: stats.pending, color: "bg-amber-500", border: "border-amber-200" },
              { name: "Overdue", count: stats.overdue, color: "bg-red-600", border: "border-red-200" },
            ].map((item, index) => (
              <div
                key={item.name}
                className={`flex items-center justify-between p-4 rounded-xl border ${item.border} bg-card hover:shadow-md transition-all duration-300 animate-slide-in cursor-default`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`} />
                  <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-2xl font-black text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}