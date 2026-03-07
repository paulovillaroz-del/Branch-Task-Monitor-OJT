'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"
import { Reminders } from "@/components/dashboard/reminders"
import { ProjectList } from "@/components/dashboard/project-list"
import { TeamCollaboration } from "@/components/dashboard/team-collaboration"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { MobileAppCard } from "@/components/dashboard/mobile-app-card"
import { TimeTracker } from "@/components/dashboard/time-tracker"
import { Button } from "@/components/ui/button"
import { AddProjectDialog } from "@/components/dashboard/add-project-dialog"

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8080/tasks')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Backend responded with ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch failed:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <Header
          title="Dashboard"
          description="Plan, prioritize, and accomplish your tasks with ease."
          actions={
            <>
              <AddProjectDialog />
              <Button
                variant="outline"
                className="w-full sm:w-auto h-9 text-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-transparent"
              >
                Import Data
              </Button>
            </>
          }
        />

        {loading && <p className="text-center mt-8 text-muted-foreground">Loading real tasks from database...</p>}

        {error && (
          <p className="text-red-500 text-center mt-8">
            Error loading tasks: {error} (check if backend is running on port 8080)
          </p>
        )}

        {!loading && !error && (
          <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
            {/* Show real number of tasks */}
            <StatsCards taskCount={tasks.length} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="lg:col-span-2 space-y-3 md:space-y-4">
                <ProjectAnalytics />
                <TeamCollaboration />
              </div>

              <div className="space-y-3 md:space-y-4">
                <Reminders />
                <ProjectProgress />
              </div>
            </div>

            {/* Pass real tasks to ProjectList */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <ProjectList tasks={tasks} />
              <MobileAppCard />
              <TimeTracker />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}