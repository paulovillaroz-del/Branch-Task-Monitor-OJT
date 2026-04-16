'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"
import { Reminders } from "@/components/dashboard/reminders"
// 1. Import the new View-Only component
import { DashboardTaskList } from "@/components/dashboard/dashboard-task-list"
import { ProjectProgress } from "@/components/dashboard/project-progress"

export default function DashboardPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn');
    const savedRole = localStorage.getItem('userRole');
    const savedEmail = localStorage.getItem('email'); 
    
    if (!loggedIn) {
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
      setRole(savedRole);
      setUserEmail(savedEmail);
    }
    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || isCheckingAuth) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        let fetchUrl = `http://localhost:8080/tasks?search=${encodeURIComponent(searchTerm)}&t=${Date.now()}`;
        
        const storageEmail = localStorage.getItem('email');
        if (role === 'user' && storageEmail) {
          fetchUrl += `&assigned_to=${encodeURIComponent(storageEmail.trim())}`;
        }

        const res = await fetch(fetchUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Backend Error: ${res.status}`);
        
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        console.error("Connection failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isAuthenticated, isCheckingAuth, searchTerm, role]);

  const branchWideTasks = tasks; 

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
           <p className="text-lg text-muted-foreground font-medium">Syncing with database...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 w-full min-w-0 lg:ml-64 p-3 md:p-6 transition-all duration-300 overflow-hidden">
        <Header
          title="Dashboard Overview"
          description={role === 'admin' ? "Branch-wide performance overview." : "Viewing your active assignments."}
          onSearch={(val) => setSearchTerm(val)}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg mt-4 text-red-600 text-center animate-in fade-in">
            ⚠️ <strong>Backend Offline:</strong> Check Go server on port 8080.
          </div>
        )}

        <div className="mt-4 md:mt-5 space-y-4 max-w-full">
          <StatsCards tasks={branchWideTasks} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 min-w-0 overflow-hidden">
              <ProjectAnalytics tasks={tasks} />
              
              <div className="grid grid-cols-1">
                {/* 2. REPLACED ProjectList WITH DashboardTaskList (View Only) */}
                <DashboardTaskList />
              </div>
            </div>

            <div className="space-y-4 min-w-0">
              <Reminders tasks={branchWideTasks} />
              <ProjectProgress tasks={branchWideTasks} />
            </div>
          </div>
        </div>
      </main>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[50] lg:hidden animate-in fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}