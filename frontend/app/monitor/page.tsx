"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, CheckCircle2, Clock, Zap, ArrowRightCircle, Loader2, Sparkles, CalendarDays } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
// 1. IMPORT Header
import { Header } from "@/components/dashboard/header"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function AdminMonitorPage() {
  const [staffData, setStaffData] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // 2. ADD state for mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const fetchStaffWorkload = async () => {
    try {
      const res = await fetch("http://localhost:8080/users")
      const data = await res.json()
      setStaffData(data)
    } catch (err) { console.error(err) }
  }

  const openPrioritySelector = async (staff: any) => {
    setSelectedStaff(staff)
    const res = await fetch(`http://localhost:8080/tasks?assigned_to=${staff.email}`)
    const allTasks = await res.json()
    const pending = allTasks.filter((t: any) => t.status === 'pending')
    setPendingTasks(pending)
    setIsDialogOpen(true)
  }

  const handleOverride = async (taskId: number) => {
    setIsUpdating(true)
    try {
      const res = await fetch("http://localhost:8080/tasks/priority-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, assigned_to: selectedStaff.email })
      })
      
      if (res.ok) {
        setTimeout(() => {
          setIsDialogOpen(false)
          setIsUpdating(false)
          fetchStaffWorkload()
        }, 800)
      }
    } catch (err) { 
      setIsUpdating(false)
      console.error(err) 
    }
  }

  useEffect(() => {
    fetchStaffWorkload()
  }, [])

  return (
    // 3. ROOT WRAPPER: relative and overflow-x-hidden for mobile stability
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      
      {/* 4. SIDEBAR: Added props for mobile control */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 5. MAIN: Added lg:ml-64 and min-w-0 for proper desktop spacing */}
      <main className="flex-1 w-full min-w-0 lg:ml-64 p-3 md:p-6 transition-all duration-300 overflow-hidden">
        
        {/* 6. HEADER: Replaces the old static title block */}
        <Header 
          title="Staff Workload Monitor"
          description="Assign priorities and manage branch capacity."
          onMenuClick={() => setIsSidebarOpen(true)}
          actions={
            <div className="flex items-center gap-2 bg-background border px-3 py-1.5 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Live Sync</span>
            </div>
          }
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staffData.map((staff: any) => (
            <Card key={staff.email} className="group relative overflow-hidden border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card">
              <CardHeader className="bg-secondary/5 pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-bold truncate">{staff.full_name}</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-primary/70 uppercase truncate">
                      {staff.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/50">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Tasks</span>
                  <Badge className={cn(
                    "font-black px-3",
                    staff.active_tasks > 0 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                  )}>
                    {staff.active_tasks}
                  </Badge>
                </div>

                {staff.active_tasks > 0 && staff.current_task && (
                  <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-3 animate-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-2">
                       <CalendarDays className="w-3.5 h-3.5 text-primary" />
                       <p className="text-[10px] font-black uppercase text-primary tracking-widest">Active Timeline</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-bold truncate leading-none">{staff.current_task.title}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Started</span>
                          <span className="text-[11px] font-semibold">{staff.current_task.start_date || "N/A"}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Deadline</span>
                          <span className="text-[11px] font-bold text-red-500">{staff.current_task.end_date || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  variant="default" 
                  className="w-full h-11 justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-all active:scale-95"
                  onClick={() => openPrioritySelector(staff)}
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300" /> 
                  Switch Priority
                </Button>

                {staff.active_tasks > 0 ? (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-700">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-normal font-bold">
                      STAFF IS CURRENTLY WORKING. OVERRIDING WILL PAUSE THE ACTIVE TASK AUTOMATICALLY.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-normal font-bold">
                      STAFF IS AVAILABLE. NEW ASSIGNMENTS WILL START IMMEDIATELY.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
 
        {/* PRIORITY SELECTOR DIALOG */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-6 bg-primary text-primary-foreground">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 fill-current text-amber-300" />
                Assign High Priority
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80 font-medium">
                Which task should <strong>{selectedStaff?.full_name}</strong> focus on right now?
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto bg-background">
              {isUpdating ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm font-bold text-primary tracking-tighter uppercase">Updating Database...</p>
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground italic">No pending tasks found for this staff member.</p>
                </div>
              ) : (
                pendingTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/5 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-black text-foreground mb-1 truncate uppercase tracking-tight">{task.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                         <Clock className="w-3 h-3" /> Due: {task.end_date}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2 shrink-0 shadow-sm"
                      onClick={() => handleOverride(task.id)}
                    >
                      ACTIVATE <ArrowRightCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="bg-secondary/20 p-4 border-t text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest">
                Priority Override System v2.0
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* 7. OVERLAY: Dims screen when mobile sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[50] lg:hidden animate-in fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}