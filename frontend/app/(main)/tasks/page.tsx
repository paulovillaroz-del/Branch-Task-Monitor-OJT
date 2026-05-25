'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProjectList } from "@/components/dashboard/project-list";
import { AddProjectDialog } from "@/components/dashboard/add-project-dialog";
import { Button } from "@/components/ui/button";
import { History, LayoutList, Loader2, Search, ClipboardList, AlertCircle, Clock } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState<string>('all'); 

  const fetchTasks = useCallback(async () => {
    const currentRole = localStorage.getItem("userRole") || localStorage.getItem("role");
    const currentEmail = localStorage.getItem("email")?.toLowerCase().trim();

    if (!currentRole) return;

    setLoading(true); 
    try {
      let fetchUrl = `http://localhost:40241/tasks?search=${encodeURIComponent(searchTerm)}&t=${Date.now()}`;
      
      if (currentRole === 'user' && currentEmail) {
        fetchUrl += `&assigned_to=${encodeURIComponent(currentEmail)}`;
      }

      const res = await fetch(fetchUrl, { 
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error("Failed to fetch");

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
    const storedRole = localStorage.getItem("userRole") || localStorage.getItem("role");
    setRole(storedRole);
    fetchTasks();
  }, [fetchTasks]);

  // 1. FILTERING (History vs Active)
  const filteredTasks = tasks.filter((task: any) => {
    const status = String(task.status || "").toLowerCase();
    const isHistoryStatus = status === 'completed' || status === 'rejected';
    return showHistory ? isHistoryStatus : !isHistoryStatus;
  });

  // 2. FIXED GROUPING LOGIC (Binabasa lang ang Values, hindi ang Keys)
  const approvalTasks: any[] = [];
  const inProgressTasks: any[] = [];
  const pendingTasks: any[] = [];

  filteredTasks.forEach((t: any) => {
    const s = String(t.status || "").toLowerCase();
    
    // Kukunin lang natin ang mga 'Values' (laman ng data) para hindi madamay ang column names like 'approval_date'
    const stringValues = Object.values(t)
      .filter(val => typeof val === 'string')
      .join(" ")
      .toLowerCase();

    const isProgressDone = Number(t.progress) >= 100 || Number(t.percentage) >= 100;
    const isSubmitted = t.is_submitted === true || t.submitted === true;

    // Check kung Approval (Basta may 'review needed' o 'approval required' sa loob ng values)
    const isApproval = 
      s.includes('approv') || 
      s.includes('review') || 
      stringValues.includes('review needed') || 
      stringValues.includes('approval required') ||
      stringValues.includes('for approval') ||
      stringValues.includes('staff approval required') ||
      isProgressDone || 
      isSubmitted;

    // Check kung In Progress (Dapat may 'progress' at HINDI belongs sa approval)
    const isInProgress = (s.includes('progress') || stringValues.includes('in-progress') || stringValues.includes('in progress')) && !isApproval;

    // Pag-hihiwalay sa Arrays
    if (isApproval) {
      approvalTasks.push(t);
    } else if (isInProgress) {
      inProgressTasks.push(t);
    } else {
      pendingTasks.push(t);
    }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
             {showHistory ? "Task History" : (role === 'admin' ? "All Workflows" : "My Assignments")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
             {showHistory ? "Archive of finished and rejected tasks." : "Manage active tasks, workflows, and statuses."}
          </p>
        </div>

        {/* CONTROLS (SEARCH & BUTTONS) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text"
               placeholder="Search task..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all bg-white shadow-sm"
             />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setShowHistory(!showHistory);
                setActiveFilter('all'); 
              }}
              className="flex-1 sm:flex-none rounded-xl gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 h-[42px] shadow-sm transition-all"
            >
              {showHistory ? <LayoutList className="w-4 h-4" /> : <History className="w-4 h-4" />}
              <span className="inline">{showHistory ? "Active View" : "View History"}</span>
            </Button>
            
            {!showHistory && role === "admin" && (
              <div className="flex-1 sm:flex-none">
                <AddProjectDialog onTaskAdded={fetchTasks} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIST CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 py-20">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-700" />
            <p className="font-semibold tracking-widest uppercase text-xs">Syncing Tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="p-4 sm:p-6 flex-1 flex flex-col gap-6">
            
            {showHistory ? (
              /* HISTORY VIEW */
              <ProjectList tasks={filteredTasks} isEditable={false} onTaskUpdated={fetchTasks} />
            ) : (
              /* ACTIVE VIEW NA MAY FILTER TABS */
              <>
                {/* BIG & LIVELY FILTER BUTTONS */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 px-1 custom-scrollbar">
                  
                  {/* ALL ACTIVE */}
                  <button 
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-2 border ${
                      activeFilter === 'all' 
                        ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-800/30 scale-105' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:scale-105'
                    }`}
                  >
                    All Active
                    <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {filteredTasks.length}
                    </span>
                  </button>

                  {/* NEEDS APPROVAL */}
                  <button 
                    type="button"
                    onClick={() => setActiveFilter('approval')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-2 border ${
                      activeFilter === 'approval' 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/40 scale-105' 
                        : 'bg-orange-50/50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300 hover:scale-105'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Needs Approval
                    <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${activeFilter === 'approval' ? 'bg-white/25 text-white' : 'bg-orange-200/70 text-orange-700'}`}>
                      {approvalTasks.length}
                    </span>
                  </button>

                  {/* IN PROGRESS */}
                  <button 
                    type="button"
                    onClick={() => setActiveFilter('inprogress')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-2 border ${
                      activeFilter === 'inprogress' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/40 scale-105' 
                        : 'bg-blue-50/50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:scale-105'
                    }`}
                  >
                    <Loader2 className="w-4 h-4" />
                    In Progress
                    <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${activeFilter === 'inprogress' ? 'bg-white/25 text-white' : 'bg-blue-200/70 text-blue-700'}`}>
                      {inProgressTasks.length}
                    </span>
                  </button>

                  {/* PENDING */}
                  <button 
                    type="button"
                    onClick={() => setActiveFilter('pending')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-2 border ${
                      activeFilter === 'pending' 
                        ? 'bg-gray-600 text-white border-gray-600 shadow-lg shadow-gray-600/30 scale-105' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:scale-105'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                    <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${activeFilter === 'pending' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {pendingTasks.length}
                    </span>
                  </button>
                </div>

                {/* LIST CONTENT BASE SA FILTER */}
                <div className="flex flex-col gap-10 mt-2">
                  
                  {/* APPROVAL SECTION */}
                  {(activeFilter === 'all' || activeFilter === 'approval') && (
                    approvalTasks.length > 0 ? (
                      <div className="animate-in fade-in duration-300">
                        {activeFilter === 'all' && (
                          <h2 className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            Needs Approval
                          </h2>
                        )}
                        <ProjectList tasks={approvalTasks} isEditable={role === 'admin'} onTaskUpdated={fetchTasks} />
                      </div>
                    ) : activeFilter === 'approval' && (
                      <div className="text-center py-10 text-gray-500 text-sm animate-in fade-in">Hooray! No tasks are waiting for approval right now.</div>
                    )
                  )}

                  {/* IN PROGRESS SECTION */}
                  {(activeFilter === 'all' || activeFilter === 'inprogress') && (
                    inProgressTasks.length > 0 ? (
                      <div className="animate-in fade-in duration-300">
                        {activeFilter === 'all' && (
                          <h2 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            In Progress
                          </h2>
                        )}
                        <ProjectList tasks={inProgressTasks} isEditable={role === 'admin'} onTaskUpdated={fetchTasks} />
                      </div>
                    ) : activeFilter === 'inprogress' && (
                      <div className="text-center py-10 text-gray-500 text-sm animate-in fade-in">There are no tasks currently in progress.</div>
                    )
                  )}

                  {/* PENDING SECTION */}
                  {(activeFilter === 'all' || activeFilter === 'pending') && (
                    pendingTasks.length > 0 ? (
                      <div className="animate-in fade-in duration-300">
                        {activeFilter === 'all' && (
                          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Pending Tasks
                          </h2>
                        )}
                        <ProjectList tasks={pendingTasks} isEditable={role === 'admin'} onTaskUpdated={fetchTasks} />
                      </div>
                    ) : activeFilter === 'pending' && (
                      <div className="text-center py-10 text-gray-500 text-sm animate-in fade-in">No pending tasks at the moment.</div>
                    )
                  )}
                  
                </div>
              </>
            )}

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 h-full text-center px-4 py-20">
            <div className="w-20 h-20 bg-gray-50/80 rounded-2xl flex items-center justify-center mb-5 border border-gray-100 shadow-sm">
               <ClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {showHistory ? "Empty History" : "No active tasks"}
            </h3>
            <p className="text-gray-500 text-sm max-w-[280px]">
              {showHistory 
                ? "There are no tasks archived in the history yet." 
                : (role === 'admin' ? "You haven't created any active tasks. Click 'Add Task' to begin." : "Hooray! You don't have any pending assignments right now.")}
            </p>
          </div>
        )}
      </div>
      
    </div>
  );
}