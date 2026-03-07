"use client"

import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/hooks/use-projects"

export function ProjectList() {
  const { projects, addProject } = useProjects()

  function handleNew() {
    const name = window.prompt("New project name:")
    if (!name) return
    addProject({ name: name.trim(), date: "No due date", icon: "📁", color: "bg-slate-400" })
  }

  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "700ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Project</h2>
        <Button onClick={handleNew} variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 bg-transparent">
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
      </div>
      <div className="space-y-3">
        {projects.map((project, index) => (
          <div
            key={`${project.name}-${index}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-all duration-300 cursor-pointer group"
            style={{ animationDelay: `${800 + index * 100}ms` }}
          >
            <div
              className={`${project.color ?? "bg-slate-400"} w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}
            >
              {project.icon ?? "📁"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{project.name}</p>
              <p className="text-xs text-muted-foreground">Due date: {project.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
