'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from "@/components/dashboard/header";
// 1. Re-imported Sidebar
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProjectList } from "@/components/dashboard/project-list";
import { AddProjectDialog } from "@/components/dashboard/add-project-dialog";
import { Button } from "@/components/ui/button";
import { History, LayoutList, Loader2 } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); 
  const [showHistory, setShowHistory] = useState(false);

  // 2. Added Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    const currentRole = localStorage.getItem("userRole");
    const currentEmail = localStorage.getItem("email")?.toLowerCase().trim();

    if (!currentRole) return;

    setLoading(true); 
    try {
      let fetchUrl = `http://localhost:8080/tasks?search=${encodeURIComponent(searchTerm)}&t=${Date.now()}`;
      
      if (currentRole === 'user' && currentEmail) {
        fetchUrl += `&assigned_to=${encodeURIComponent(currentEmail)}`;
      }

      const res = await fetch(fetchUrl, { cache: 'no-store' });
      const contentType = res.headers.get("content-type");

      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response");
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setTasks([]); 
    } finally {
      setLoading(false); 
    }
  }, [searchTerm]);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole"); 
    const savedEmail = localStorage.getItem("email"); 
    
    setRole(savedRole);
    setUserEmail(savedEmail);

    if (savedRole) {
      fetchTasks();
    }
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((task: any) => {
    const status = task.status?.toLowerCase() || "";
    const isCompleted = status === 'completed';
    return showHistory ? isCompleted : !isCompleted;
  });

  return (
    /**
     * FIX: Restored the wrapping <div> and Sidebar.
     * Restored 'lg:ml-64' so the content doesn't sit under the sidebar.
     */
    <div className="relative flex min-h-screen bg-background overflow-x-hidden">
      
      {/* 3. Restored Sidebar with mobile toggle logic */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 w-full min-w-0 lg:ml-64 p-3 md:p-6 lg:p-8 animate-in fade-in duration-500">
        <Header
          title={showHistory ? "Task History" : (role === 'admin' ? "Tasks Workflows" : "My Assignments")}
          description={showHistory ? "Archive of finished branch tasks." : "Manage active tasks and review approval requests."}
          onSearch={(val) => setSearchTerm(val)}
          
          // 4. Added the missing Handshake function for mobile
          onMenuClick={() => setIsSidebarOpen(true)}
          
          actions={
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2 bg-card hover:bg-secondary transition-colors font-bold"
              >
                {showHistory ? <LayoutList className="w-4 h-4" /> : <History className="w-4 h-4" />}
                {showHistory ? "Show Active" : "View History"}
              </Button>
              
              {!showHistory && role === "admin" && (
                <AddProjectDialog onTaskAdded={fetchTasks} />
              )}
            </div>
          } 
        />

        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
              <p className="animate-pulse font-medium">Updating task list...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProjectList 
                tasks={filteredTasks} 
                isEditable={!showHistory && role === 'admin'} 
                onTaskUpdated={fetchTasks} 
              />
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl border-muted/50 mt-4 bg-secondary/5">
              <p className="text-muted-foreground italic font-medium">
                {showHistory 
                  ? "No tasks found in history." 
                  : (role === 'admin' ? "No active tasks found. Create one to get started!" : `No tasks assigned to ${userEmail || 'your account'}.`)}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 5. Mobile Background Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[50] lg:hidden animate-in fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}