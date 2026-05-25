"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Folder, Calendar, User, Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardTaskList() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardTasks = async () => {
      try {
        setLoading(true)
        // 1. Identify who is logged in
        const userRole = localStorage.getItem("userRole") || "user";
        const userEmail = localStorage.getItem("email")?.toLowerCase().trim();

        const res = await fetch("http://localhost:40241/tasks")
        const data = await res.json()
        
        if (!Array.isArray(data)) return;

        // 2. FILTER LOGIC
        const filteredTasks = data.filter((task: any) => {
          const isNotCompleted = task.status?.toLowerCase() !== 'completed';
          
          // ADMIN: Sees all non-completed tasks
          if (userRole === "admin") {
            return isNotCompleted;
          }
          
          // STAFF: Only sees non-completed tasks assigned specifically to them
          return isNotCompleted && task.assigned_to?.toLowerCase().trim() === userEmail;
        })
        
        setTasks(filteredTasks.slice(0, 5)) 
      } catch (err) {
        console.error("Dashboard Overview Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardTasks()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Live Task 
          </h3>
          <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <Badge variant="outline" className="text-[10px] font-bold text-primary bg-primary/5 border-primary/20 uppercase">
          {localStorage.getItem("userRole") === "admin" ? "All Active" : "My Tasks"}
        </Badge>
      </div>
      
      {tasks.length > 0 ? (
        tasks.map((task) => {
          // --- LIVE OVERDUE CALCULATION LOGIC ---
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Strip time variables to ensure clean day matching

          const taskDueDate = task.end_date ? new Date(task.end_date) : null;
          const isOverdue = taskDueDate && taskDueDate < today && task.status !== "completed";

          return (
            <Card key={task.id} className={cn(
              "p-4 border-border/50 transition-all duration-300 shadow-sm",
              task.is_requesting_approval ? "bg-amber-50/20 border-amber-200/50" : "bg-card"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-secondary/50 rounded-lg shrink-0">
                    <Folder className={cn(
                      "w-4 h-4",
                      task.is_requesting_approval ? "text-amber-600" : "text-primary"
                    )} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-none mb-1 tracking-tight">{task.title}</h4>
                    <p className="text-[11px] text-muted-foreground uppercase font-medium line-clamp-1 italic">
                      {task.description}
                    </p>
                    
                    <div className="flex gap-3 mt-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/70">
                        <Calendar className="w-3 h-3" /> {task.end_date || "No deadline"}
                      </div>
                      {/* Only show "Assigned To" label for Admins */}
                      {localStorage.getItem("userRole") === "admin" && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/70">
                          <User className="w-3 h-3" /> {task.assigned_to?.split('@')[0] || "Unassigned"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Updated Dynamic Status Badge color & content mapping */}
                <Badge variant="outline" className={cn(
                    "text-[9px] font-black uppercase tracking-tighter h-5 px-2",
                    isOverdue ? "text-red-600 border-red-200 bg-red-50/50" : // Overdue warning style
                    task.status === "in-progress" ? "text-blue-600 border-blue-200 bg-blue-50/50" :
                    "text-amber-600 border-amber-200 bg-amber-50/50"
                )}>
                  {task.is_requesting_approval 
                    ? "Pending Review" 
                    : isOverdue 
                      ? "⚠️ Overdue" 
                      : task.status}
                </Badge>
              </div>

              {task.is_requesting_approval && (
                <div className="mt-3 flex items-center gap-2 text-[9px] font-extrabold text-amber-700 bg-amber-100/50 p-2 rounded-lg border border-amber-200/50">
                   <Info className="w-3 h-3" />
                   {localStorage.getItem("userRole") === "admin" 
                     ? "APPROVAL REQUIRED. MANAGE THIS IN THE TASKS PAGE."
                     : "WAITING FOR ADMIN APPROVAL."}
                </div>
              )}
            </Card>
          )
        })
      ) : !loading && (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-secondary/5 border-muted/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mb-3" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
             No Active Assignments
          </p>
        </div>
      )}
    </div>
  )
}