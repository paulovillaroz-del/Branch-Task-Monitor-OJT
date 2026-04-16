'use client';

import { useEffect, useState } from "react";
// 1. REMOVED Header import - handled by layout.tsx
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProjectAnalytics } from "@/components/dashboard/project-analytics";
import { Reminders } from "@/components/dashboard/reminders";
import { ProjectProgress } from "@/components/dashboard/project-progress";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const savedRole = localStorage.getItem("userRole");
      const savedEmail = localStorage.getItem("email");

      try {
        let url = "http://localhost:8080/tasks?t=" + Date.now();
        if (savedRole === "user" && savedEmail) {
          url += `&assigned_to=${encodeURIComponent(savedEmail.trim())}`;
        }

        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setTasks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("❌ Dashboard fetch error:", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <main className="w-full min-w-0 p-3 md:p-6 transition-all duration-300">
      {/* 2. CRITICAL: The <Header /> tag has been DELETED from here. 
             It is already rendered by app/dashboard/layout.tsx.
      */}
      
      <div className="space-y-6">
        <StatsCards tasks={tasks} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 min-w-0 overflow-hidden">
            <ProjectAnalytics tasks={tasks} />
          </div>

          <div className="space-y-6">
            <Reminders tasks={tasks} />
            <ProjectProgress tasks={tasks} />
          </div>
        </div>
      </div>
    </main>
  );
}