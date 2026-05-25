'use client';

import { useEffect, useState } from "react";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const savedRole = localStorage.getItem("userRole") || "user";
      const savedEmail = localStorage.getItem("email");
      const savedName = localStorage.getItem("userName") || localStorage.getItem("full_name") || "Staff";

      setRole(savedRole);
      setUserName(savedName);

      try {
        const res = await fetch(`http://localhost:40241/tasks?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setTasks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  // Data processing logic
  const processedTasks = tasks.map((task: any) => {
    const status = task.status?.toLowerCase() || "";
    const isOverdue = task.end_date && new Date(task.end_date) < new Date() && status !== 'completed' && status !== 'rejected';
    return { ...task, status: isOverdue ? 'overdue' : status };
  });

  return (
    <div className="animate-in fade-in duration-500">
      {role === "admin" ? (
        <AdminDashboard tasks={processedTasks} loading={loading} userName={userName} />
      ) : (
        <StaffDashboard tasks={processedTasks} loading={loading} userName={userName} />
      )}
    </div>
  );
}