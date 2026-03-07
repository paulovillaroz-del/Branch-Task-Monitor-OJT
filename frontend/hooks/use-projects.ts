"use client"

import { useEffect, useState } from "react"

export type Project = {
  name: string
  date: string
  color?: string
  icon?: string
}

const STORAGE_KEY = "btm_projects"

const defaultProjects: Project[] = [
  { name: "Develop API Endpoints", date: "Nov 26, 2024", color: "bg-blue-500", icon: "⚡" },
  { name: "Onboarding Flow", date: "Nov 28, 2024", color: "bg-cyan-500", icon: "🌊" },
  { name: "Build Dashboard", date: "Nov 30, 2024", color: "bg-emerald-500", icon: "🎨" },
  { name: "Optimize Page Load", date: "Dec 5, 2024", color: "bg-amber-500", icon: "⚡" },
  { name: "Cross-Browser Testing", date: "Dec 6, 2024", color: "bg-purple-500", icon: "🔍" },
]

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
      return raw ? (JSON.parse(raw) as Project[]) : defaultProjects
    } catch {
      return defaultProjects
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch {
      // ignore
    }
  }, [projects])

  function addProject(p: Project) {
    setProjects((prev) => [p, ...prev])
  }

  return { projects, addProject }
}
