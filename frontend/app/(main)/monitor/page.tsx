"use client"

import { useEffect, useState } from "react"
import { Users, ShieldAlert, Zap, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

interface ActiveTask {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface StaffMonitorData {
  email: string;
  full_name: string;
  active_tasks_count: number;
  current_task: ActiveTask | null;
  all_user_tasks: any[]; // Imbakan ng lahat ng tasks ng staff para sa select menu
}

export default function StaffMonitorPage() {
  const [staffData, setStaffData] = useState<StaffMonitorData[]>([])
  const [loading, setLoading] = useState(true)
  const [switchingId, setSwitchingId] = useState<number | null>(null)

  const fetchMonitorData = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:40241/users")
      const users = await res.json()
      
      const taskRes = await fetch("http://localhost:40241/tasks")
      const tasks = await taskRes.json()

      if (Array.isArray(users) && Array.isArray(tasks)) {
        const staffMembers = users
          .filter((u: any) => u.role !== "admin")
          .map((u: any) => {
            // Siguraduhing lowercase pareho para walang string mismatch filter sa component
            const userTasks = tasks.filter((t: any) => t.assigned_to && t.assigned_to.toLowerCase().trim() === u.email.toLowerCase().trim())
            
            // Kuhanin ang totoong kasalukuyang in-progress task
            const activeTask = userTasks.find((t: any) => t.status.toLowerCase() === "in-progress") || null
            
            return {
              email: u.email.toLowerCase().trim(), // 🔴 LOCKED TO LOWERCASE EMAIL
              full_name: u.full_name || u.email.split('@')[0],
              active_tasks_count: userTasks.filter((t: any) => t.status.toLowerCase() !== "completed").length,
              current_task: activeTask ? {
                id: activeTask.id,
                title: activeTask.title,
                start_date: activeTask.start_date,
                end_date: activeTask.end_date,
                status: activeTask.status
              } : null,
              all_user_tasks: userTasks
            }
          })
        setStaffData(staffMembers)
      }
    } catch (err) {
      console.error("Failed to compile workload logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitorData()
  }, [])

  // 🔴 FRONTEND API LINKAGE WITH ACCURATE EMAIL PAYLOAD & SAFE PAYLOAD PARSING
  const handleSwitchPriority = async (taskId: number, email: string) => {
    if (!taskId || !email) return;
    
    // Tinitiyak na ang totoong email address (may @cmdi.edu.ph) ang ipinapadala sa endpoint query param!
    const cleanEmail = email.toLowerCase().trim();
    setSwitchingId(taskId);
    
    try {
      console.log(`🚀 Triggering Switch Priority -> Task ID: ${taskId} | Target Email: ${cleanEmail}`);
      
      const res = await fetch(`http://localhost:40241/tasks/${taskId}/switch-priority?email=${encodeURIComponent(cleanEmail)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json' 
        }
      });

      // Binabasa muna ang response data para ma-verify kung "success" ang status object entry
      const data = await res.json().catch(() => ({}));

      if (res.ok || data.status === "success") {
        console.log("... priority track updated in database successfully!");
        await fetchMonitorData();
        window.location.href = "/monitor"; // I-refresh ang monitor route view window panel
      } else {
        console.error("❌ Backend rejected the switch request:", data);
        alert("Failed to switch task priority. Please check backend logs or database port integrity configurations.");
      }
    } catch (err) {
      console.error("❌ Network error execution failed during priority swap:", err);
      alert("Network Error: Could not reach the backend. Please check if your Go server is currently running in your terminal panel.");
    } finally {
      setSwitchingId(null);
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return "Not set"
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-2 family-sans">
      
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Staff Workload Monitor</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign priorities, track active team load allocations, and manage branch capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SYNC
          </span>
          <button onClick={fetchMonitorData} className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition active:scale-95">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid Display for Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold tracking-wider uppercase">
            Loading team workloads...
          </div>
        ) : staffData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold tracking-wider uppercase">
            No active staff found.
          </div>
        ) : (
          staffData.map((staff) => {
            // Sasalain ang mga 'pending' tasks na pwedeng piliin para sa priority swapping engine
            const selectableTasks = staff.all_user_tasks.filter((t: any) => 
              t.status && t.status.toLowerCase() === "pending" && 
              t.id !== staff.current_task?.id
            );

            return (
              <div key={staff.email} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all">
                
                {/* Top Details: User Profile Summary */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{staff.full_name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{staff.email.toLowerCase()}</p>
                  </div>
                </div>

                {/* Middle Section: Active Workload Tracker Panel */}
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Tasks</span>
                    <span className="text-xs font-black px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border">
                      {staff.active_tasks_count}
                    </span>
                  </div>

                  {staff.current_task ? (
                    <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-3">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Active Timeline
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {staff.current_task.title}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500 border-t border-slate-200/60 pt-2.5">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-tight">Started</span>
                          <span className="text-slate-700 font-semibold">{formatFriendlyDate(staff.current_task.start_date)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-tight">Deadline</span>
                          <span className="text-rose-600 font-bold">{formatFriendlyDate(staff.current_task.end_date)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[90px]">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                      <p className="text-[11px] font-bold text-emerald-800">Staff is Available</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">Ready for new task priority mapping assignments.</p>
                    </div>
                  )}
                </div>

                {/* Dropdown Engine: Siguradong staff.email (lowercase at trimmed) ang ipinapasa */}
                <div className="space-y-2.5 pt-1">
                  {selectableTasks.length > 0 ? (
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Select Task to Prioritize:</label>
                      <select 
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-slate-300 transition"
                        onChange={(e) => {
                          if (e.target.value) {
                            // 🔥 GINAGARANTIYA NA TOTOONG EMAIL ADDRESS (MULA SA staff.email) ANG IPINAPASA SA METHOD AT HINDI DISPLAY NAME
                            handleSwitchPriority(Number(e.target.value), staff.email);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Select Priority Assignment --</option>
                        {selectableTasks.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.status.toLowerCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <button disabled className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 border border-dashed text-slate-400 font-bold rounded-lg text-xs cursor-not-allowed">
                      No Alternative Tasks Available
                    </button>
                  )}

                  {staff.current_task && (
                    <p className="text-[10px] text-amber-600 font-semibold text-center leading-tight bg-amber-50 border border-amber-100/70 p-2 rounded-lg">
                      *Selecting a task from the list will automatically pause the current track.
                    </p>
                  )}
                </div>

              </div>
            )
          })
        )}
      </div>

    </div>
  )
}