"use client"

import { useState, useEffect } from "react"
import { Bell, CalendarClock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Reminders() {
  const [reminders, setReminders] = useState<{title: string, due_date: string}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch from your Go Backend
      fetch("http://localhost:40241/tasks/reminders")
      .then(res => res.json())
      .then(data => {
        setReminders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error("Reminders fetch error:", err)
        setLoading(false)
      })
  }, [])

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-xs text-muted-foreground animate-pulse text-center py-4">Loading reminders...</p>
        ) : reminders.length > 0 ? (
          reminders.map((task, i) => (
            <div 
              key={i} 
              className="p-3 rounded-xl bg-secondary/10 border border-border/50 flex items-center gap-3 hover:bg-secondary/20 transition-colors"
            >
              <div className="p-2 rounded-lg bg-background shadow-sm text-primary">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate text-foreground uppercase tracking-tight">
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Due: <span className="text-destructive">{task.due_date}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground italic">No urgent tasks due soon.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 