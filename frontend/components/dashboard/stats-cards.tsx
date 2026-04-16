"use client"

import { ArrowUpRight, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Task {
  id: number;
  title: string;
  status: string;
  end_date?: string; 
}

interface StatsCardsProps {
  tasks: Task[];
  loading?: boolean;
}

export function StatsCards({ tasks = [], loading = false }: StatsCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // --- CALCULATION LOGIC ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = (tasks || []).reduce((acc, task) => {
    const status = task.status?.toLowerCase().trim();
    const endDate = task.end_date ? new Date(task.end_date) : null;
    const isOverdue = endDate && endDate < today && status !== 'completed';

    if (isOverdue) {
      acc.overdue += 1;
    }

    if (status === 'pending') {
      acc.pending += 1;
    } else if (status === 'in-progress' || status === 'in progress') {
      acc.inProgress += 1;
    } else if (status === 'completed') {
      acc.completed += 1;
    }

    return acc;
  }, { pending: 0, inProgress: 0, completed: 0, overdue: 0 });

  const stats = [
    { 
      title: "Total Tasks", 
      value: tasks.length, 
      bgColor: "bg-white border-muted", 
      textColor: "text-foreground", 
      delay: "0ms" 
    },
    { 
      title: "Pending", 
      value: counts.pending, 
      bgColor: "bg-amber-50/50 border-amber-100", 
      textColor: "text-amber-600", 
      delay: "100ms" 
    },
    { 
      title: "In Progress", 
      value: counts.inProgress, 
      bgColor: "bg-blue-50/50 border-blue-100", 
      textColor: "text-blue-600", 
      delay: "200ms" 
    },
    { 
      title: "Completed", 
      value: counts.completed, 
      bgColor: "bg-emerald-50/50 border-emerald-100", 
      textColor: "text-emerald-600", 
      delay: "300ms" 
    },
    { 
      title: "Overdue", 
      value: counts.overdue, 
      bgColor: "bg-red-50/50 border-red-100", 
      textColor: "text-red-600", 
      delay: "400ms" 
    },
  ]

  return (
    /* MOBILE FIX: 
      - grid-cols-2: Shows 2 cards side-by-side on most phones.
      - lg:grid-cols-3: 3 cards on tablets.
      - xl:grid-cols-5: 5 cards only on large desktop screens.
      - gap-3 md:gap-4: Smaller gaps on mobile to save space.
    */
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 w-full">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{ animationDelay: stat.delay }}
          className={cn(
            stat.bgColor,
            stat.textColor,
            "relative flex flex-col justify-between border p-4 md:p-5 transition-all duration-300 ease-out animate-slide-in-up cursor-pointer",
            /* min-w-0 is vital for the 'truncate' class to work on the title */
            "min-w-0 w-full overflow-hidden shrink-0", 
            hoveredCard === index ? "lg:scale-[1.02] lg:-translate-y-1 z-10 shadow-lg" : "shadow-sm"
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-3 md:mb-4">
            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-70 truncate">
              {stat.title}
            </h3>
            {/* Arrows are hidden on very small screens to give title more room, or kept small */}
            <div
              className={cn(
                "w-6 h-6 md:w-7 md:h-7 rounded-full bg-white border flex items-center justify-center transition-all duration-300 shadow-sm shrink-0",
                hoveredCard === index ? "bg-primary text-white border-primary rotate-45" : "text-muted-foreground"
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5 md:w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-1 md:gap-2">
            <p className="text-2xl md:text-3xl lg:text-4xl font-black font-sans tracking-tight tabular-nums">
              {loading ? "..." : stat.value}
            </p>
          </div>
          
          <div className="mt-3 md:mt-4 flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold opacity-60">
            <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
            <span className="truncate uppercase">Postgres Sync</span>
          </div>
        </Card>
      ))}
    </div>
  )
}