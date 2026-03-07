"use client"

import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProjects } from "@/hooks/use-projects"

export function AddProjectDialog() {
  const { addProject } = useProjects()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [icon, setIcon] = useState("📁")
  const [color, setColor] = useState("bg-blue-500")

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!name.trim()) return
    addProject({ name: name.trim(), date: date || "No due date", icon, color })
    setName("")
    setDate("")
    setIcon("📁")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105">+ Add Project</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Add a new project to your workspace.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-3 mt-2">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
          </div>

          <div>
            <Label>Due date</Label>
            <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g. Dec 31, 2025" />
          </div>

          <div>
            <Label>Icon (emoji)</Label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📁" />
          </div>

          <div>
            <Label>Color (tailwind class)</Label>
            <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="bg-blue-500" />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
