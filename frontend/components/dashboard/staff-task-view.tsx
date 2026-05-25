"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Folder, Calendar, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface Task {
  id: number;
  title: string;
  status: string;
  end_date: string; // O due_date depende sa backend mo
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
      // Nagdagdag ng timestamp para laging fresh ang data pagkabukas ng sheet
      fetch(`http://localhost:40241/tasks?assigned_to=${encodeURIComponent(email)}&t=${Date.now()}`)
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

  // Helper function para sa dynamic colors at icons ng status
  const getStatusStyle = (statusString: string) => {
    const s = String(statusString || "").toLowerCase();
    if (s.includes("approv") || s.includes("review")) {
      return { bg: "bg-orange-100", text: "text-orange-700", icon: <AlertCircle className="w-3 h-3 mr-1" /> };
    }
    if (s.includes("progress") || s.includes("working")) {
      return { bg: "bg-blue-100", text: "text-blue-700", icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" /> };
    }
    if (s === "completed") {
      return { bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> };
    }
    if (s === "overdue") {
      return { bg: "bg-red-100", text: "text-red-700", icon: <AlertCircle className="w-3 h-3 mr-1" /> };
    }
    // Default / Pending
    return { bg: "bg-gray-100", text: "text-gray-700", icon: <Clock className="w-3 h-3 mr-1" /> };
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black tracking-widest shadow-sm">
              {fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-gray-900">{fullName}</div>
              <div className="text-xs font-normal text-muted-foreground tracking-wide">{email}</div>
            </div>
          </SheetTitle>
          <SheetDescription className="pt-2">
            Viewing all tasks currently assigned to this staff member.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-emerald-700">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-xs font-bold tracking-widest uppercase">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
              <Folder className="w-12 h-12 mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">No tasks assigned yet.</p>
              <p className="text-xs mt-1">This staff member is currently free.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const statusStyle = getStatusStyle(task.status);
              
              return (
                <div key={task.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 border border-gray-100">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">{task.title}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-gray-500">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        <span>Due: {task.end_date || "No deadline"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className={`${statusStyle.bg} ${statusStyle.text} border-none text-[10px] font-bold capitalize flex items-center w-fit mt-3 sm:mt-0 px-2.5 py-1`}>
                    {statusStyle.icon}
                    {task.status || "Pending"}
                  </Badge>
                </div>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}