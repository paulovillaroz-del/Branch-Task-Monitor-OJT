"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface StaffMember {
  email: string;
  full_name: string;
  active_tasks: number; 
}

interface EditTaskDialogProps {
  task: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  onTaskUpdated?: () => void;
}

export function EditTaskDialog({ task, open, setOpen, onTaskUpdated }: EditTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")
  const [startDate, setStartDate] = useState("") 
  const [endDate, setEndDate] = useState("")     
  const [assignedTo, setAssignedTo] = useState("") 
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetch("http://localhost:8080/users")
        .then(res => res.json())
        .then(data => {
          setStaffList(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error("Failed to load staff:", err))
    }
  }, [open])

  useEffect(() => {
    if (task && open) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setStatus(task.status || "pending")
      setStartDate(task.start_date || "")
      setEndDate(task.end_date || "")
      setAssignedTo(task.assigned_to || "")
    }
  }, [task, open])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return;
    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:8080/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status: status,
          start_date: startDate,
          end_date: endDate,
          assigned_to: assignedTo,
        }),
      })

      if (response.ok) {
        setOpen(false)
        if (onTaskUpdated) {
          onTaskUpdated();
        } else {
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        alert("Update failed: " + (errorData.error || "Server error"));
      }
    } catch (error) {
      console.error("Update failed:", error)
      alert("Cannot connect to server. Ensure Go is running.");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
  className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-[95vw] max-w-[425px] bg-background rounded-2xl border shadow-2xl max-h-[92vh] overflow-y-auto !translate-x-0 !translate-y-0 !left-0 !top-0 m-auto outline-none"
>
  <div className="w-full h-fit max-h-full">
    <DialogHeader className="mb-4">
      <DialogTitle className="font-bold text-xl tracking-tight text-foreground">
        Edit Task Details
      </DialogTitle>
      <DialogDescription className="font-medium text-muted-foreground text-sm">
        Modify the project details or reassign the staff member.
      </DialogDescription>
    </DialogHeader>

          <form onSubmit={onSubmit} className="grid gap-3 py-2 md:gap-4 md:py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Project Name</Label>
              <Input id="edit-name" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-secondary/30 border-none h-10 md:h-11 focus-visible:ring-emerald-500" required />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-description" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Description</Label>
              <Input id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-secondary/30 border-none h-10 md:h-11 focus-visible:ring-emerald-500" />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-assignee" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Assigned Staff</Label>
              <select 
                id="edit-assignee"
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)} 
                className="flex h-10 md:h-11 w-full rounded-md border-none bg-secondary/30 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none"
                required
              >
                <option value="">Select Staff...</option>
                {staffList.map((staff) => (
                  <option key={staff.email} value={staff.email}>
                    {staff.full_name} {staff.email === task.assigned_to ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-start" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Start Date</Label>
                <Input id="edit-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary/30 border-none h-10 md:h-11 text-xs" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-end" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">End Date</Label>
                <Input id="edit-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-secondary/30 border-none h-10 md:h-11 text-xs" required />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-status" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Status</Label>
              <select 
                id="edit-status"
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="flex h-10 md:h-11 w-full rounded-md border-none bg-secondary/30 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-11 md:h-12 shadow-lg shadow-emerald-200 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}