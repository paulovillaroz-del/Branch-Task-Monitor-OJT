"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Folder, Calendar } from "lucide-react"

interface Task {
  id: number;
  title: string;
  status: string;
  end_date: string;
}

export function StaffTaskView({ email, fullName, open, onOpenChange }: { 
  email: string, 
  fullName: string, 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && email) {
      setLoading(true)
      // Optimized: Fetch ONLY tasks assigned to this specific email from the backend
      fetch(`http://localhost:8080/tasks?assigned_to=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          setTasks(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(err => {
          console.error("Staff fetch error:", err);
          setLoading(false);
        })
    }
  }, [open, email])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              {fullName.substring(0, 2).toUpperCase()}
            </div>
            {fullName}'s Active Tasks
          </SheetTitle>
          <SheetDescription>
            Viewing all tasks assigned to {email}.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse text-center py-10">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No tasks assigned yet.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-xl border border-border/50 bg-secondary/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{task.end_date || "No deadline"}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold capitalize">
                  {task.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}