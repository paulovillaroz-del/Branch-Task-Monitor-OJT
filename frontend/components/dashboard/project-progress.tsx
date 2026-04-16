"use client"

import { Card } from "@/components/ui/card"

interface Task {
  status: string;
}

export function ProjectProgress({ tasks = [] }: { tasks: Task[] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status?.toLowerCase() === 'completed').length;
  
  // Calculate percentage (avoid division by zero)
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="p-6 border-muted/40 shadow-sm">
      <h3 className="text-sm font-bold mb-6 text-muted-foreground uppercase tracking-wider">Project Progress</h3>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-32 h-32">
          {/* Background Circle */}
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-secondary stroke-current"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress Circle */}
            <path
              className="text-primary stroke-current transition-all duration-1000 ease-out"
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black">{percentage}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          {completed} of {total} tasks finished
        </p>
      </div>
    </Card>
  )
}