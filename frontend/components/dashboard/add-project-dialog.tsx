"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"

interface StaffMember {
  email: string;
  full_name: string;
  active_tasks: number; 
}

export function AddProjectDialog({ onTaskAdded }: { onTaskAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")
  const [startDate, setStartDate] = useState("") 
  const [endDate, setEndDate] = useState("")     
  const [assignedTo, setAssignedTo] = useState("") 
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetch("http://localhost:8080/users")
        .then(res => res.json())
        .then(data => setStaffList(Array.isArray(data) ? data : []))
        .catch(err => console.error("Failed to load staff list:", err))
    }
  }, [open])

  const resetForm = () => {
    setTitle(""); 
    setDescription(""); 
    setStatus("pending");
    setStartDate(""); 
    setEndDate(""); 
    setAssignedTo("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!assignedTo) {
      alert("Please select a staff member.");
      return;
    }

    setIsSubmitting(true)

    const payload = {
      title: title.trim(),
      description: description.trim() || "No description provided",
      status: status,
      start_date: startDate,
      end_date: endDate,
      assigned_to: assignedTo.trim(), 
    }

    try {
      const response = await fetch("http://localhost:8080/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json();

      if (response.ok) {
        setOpen(false); 
        resetForm();
        if (onTaskAdded) onTaskAdded(); 
      } else {
        alert(`Error: ${result.error || "Failed to create task"}`);
      }
    } catch (error) {
      console.error("Connection failed:", error)
      alert("Cannot connect to server. Check if Go backend is running.");
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableStaff = staffList.filter(s => (s.active_tasks || 0) === 0);

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all font-bold">
          + Add Project
        </Button>
      </DialogTrigger>

      <DialogContent 
  className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-[95vw] max-w-[425px] bg-background rounded-2xl border shadow-2xl max-h-[92vh] overflow-y-auto !translate-x-0 !translate-y-0 !left-0 !top-0 m-auto outline-none"
>
  <div className="w-full h-fit max-h-full">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold tracking-tight">Create New Project</DialogTitle>
      <DialogDescription className="text-sm font-medium text-muted-foreground">
        Assign tasks directly to registered branch staff.
      </DialogDescription>
    </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground tracking-widest px-1">Project Name</Label>
              <Input 
                id="name" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Inventory Audit" 
                className="bg-secondary/20 border-none h-11"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase text-muted-foreground tracking-widest px-1">Description</Label>
              <Input 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="What needs to be done?" 
                className="bg-secondary/20 border-none h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-xs font-bold uppercase text-muted-foreground tracking-widest px-1">Assign to Staff</Label>
              <select 
                id="assignee"
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)} 
                className="flex h-11 w-full rounded-md border-none bg-secondary/20 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none"
                required
              >
                <option value="" disabled>Select staff member...</option>
                {staffList.map((staff) => (
                  <option key={staff.email} value={staff.email} className="text-black">
                    {staff.full_name} ({staff.email})
                  </option>
                ))}
              </select>
              
              {staffList.length > 0 && availableStaff.length === 0 && (
                <div className="flex items-center gap-2 text-[10px] text-red-600 font-bold mt-1 bg-red-50 p-2 rounded border border-red-100 animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  <span>All staff are currently busy.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start" className="text-xs font-bold uppercase text-muted-foreground tracking-widest px-1">Start Date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary/20 border-none text-xs" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end" className="text-xs font-bold uppercase text-muted-foreground tracking-widest px-1">End Date</Label>
                <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-secondary/20 border-none text-xs" required />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2 flex flex-col sm:flex-row">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="font-bold order-2 sm:order-1">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 font-bold min-w-[140px] shadow-lg order-1 sm:order-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}