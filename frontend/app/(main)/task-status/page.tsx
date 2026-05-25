'use client';

import { useState, useEffect } from 'react';
import { ListChecks, Clock, Loader2, CheckCircle2, AlertTriangle, UserCircle } from "lucide-react";

export default function TaskStatusPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0, // <-- Dinagdag ang overdue stat
  });
  const [staffData, setStaffData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAndProcessTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:40241/tasks?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        
        const data = await res.json();
        const tasks = Array.isArray(data) ? data : [];

        let total = tasks.length;
        let pending = 0;
        let inProgress = 0;
        let completed = 0;
        let overdue = 0; // <-- Counter para sa overdue

        const staffMap: Record<string, any> = {};

        tasks.forEach((task: any) => {
          let status = (task.status || "pending").toLowerCase();
          const assigneeEmail = task.assigned_to?.trim() || "Unassigned";

          // LOGIC PARA SA OVERDUE:
          // Kung may "due_date" ka sa database at lumipas na ang date ngayon, automatic na magiging overdue ito.
          // O kaya kung literal na "overdue" ang nakalagay na status string sa backend mo.
          if (status !== "completed") {
            const isPastDue = task.due_date && new Date(task.due_date) < new Date();
            if (status === "overdue" || isPastDue) {
              status = "overdue";
            }
          }

          // 1. Bilangin ang total stats
          if (status === "pending") pending++;
          else if (status === "in progress") inProgress++;
          else if (status === "completed") completed++;
          else if (status === "overdue") overdue++;

          // 2. I-setup ang staff profile kung wala pa
          if (!staffMap[assigneeEmail]) {
            const namePart = assigneeEmail.includes('@') ? assigneeEmail.split('@')[0] : assigneeEmail;
            staffMap[assigneeEmail] = {
              id: assigneeEmail,
              email: assigneeEmail,
              name: assigneeEmail !== "Unassigned" ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : "Unassigned",
              pending: 0,
              inProgress: 0,
              completed: 0,
              overdue: 0 // <-- Dinagdag sa staff profile
            };
          }

          // 3. Idagdag ang count sa specific na staff
          if (status === "pending") staffMap[assigneeEmail].pending++;
          else if (status === "in progress") staffMap[assigneeEmail].inProgress++;
          else if (status === "completed") staffMap[assigneeEmail].completed++;
          else if (status === "overdue") staffMap[assigneeEmail].overdue++;
        });

        setStats({ total, pending, inProgress, completed, overdue });
        setStaffData(Object.values(staffMap));

      } catch (error) {
        console.error("Error fetching task status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessTasks();
    const interval = setInterval(fetchAndProcessTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPct = (value: number) => stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-700" />
        <p className="font-medium tracking-widest uppercase text-xs">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Task Status</h1>
        <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">
          Overview for <span className="text-emerald-700 font-bold">System Admin</span>
        </p>
      </div>

      {/* STATUS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Total Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden shadow-sm">
          <ListChecks className="absolute right-4 top-4 w-10 h-10 text-gray-900 opacity-10" />
          <div className="text-[10px] tracking-widest font-bold uppercase text-gray-900 mb-2">Total Tasks</div>
          <div className="text-4xl font-black text-gray-900 mb-1">{stats.total}</div>
          <div className="text-xs text-gray-500 mb-3">All tasks across the system</div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-gray-400 w-full rounded-full"></div>
          </div>
          <div className="text-[11px] text-gray-400">100% of total</div>
        </div>

        {/* Pending */}
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-5 relative overflow-hidden shadow-sm">
          <Clock className="absolute right-4 top-4 w-10 h-10 text-orange-500 opacity-20" />
          <div className="text-[10px] tracking-widest font-bold uppercase text-orange-600 mb-2">Pending</div>
          <div className="text-4xl font-black text-orange-600 mb-1">{stats.pending}</div>
          <div className="text-xs text-gray-500 mb-3">Awaiting action</div>
          <div className="h-1.5 w-full bg-orange-200/50 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${getPct(stats.pending)}%` }}></div>
          </div>
          <div className="text-[11px] text-gray-400">{getPct(stats.pending)}% of total</div>
        </div>

        {/* In Progress */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 relative overflow-hidden shadow-sm">
          <Loader2 className="absolute right-4 top-4 w-10 h-10 text-blue-600 opacity-20" />
          <div className="text-[10px] tracking-widest font-bold uppercase text-blue-600 mb-2">In Progress</div>
          <div className="text-4xl font-black text-blue-600 mb-1">{stats.inProgress}</div>
          <div className="text-xs text-gray-500 mb-3">Currently being worked on</div>
          <div className="h-1.5 w-full bg-blue-200/50 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${getPct(stats.inProgress)}%` }}></div>
          </div>
          <div className="text-[11px] text-gray-400">{getPct(stats.inProgress)}% of total</div>
        </div>

        {/* Completed */}
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5 relative overflow-hidden shadow-sm">
          <CheckCircle2 className="absolute right-4 top-4 w-10 h-10 text-emerald-600 opacity-20" />
          <div className="text-[10px] tracking-widest font-bold uppercase text-emerald-700 mb-2">Completed</div>
          <div className="text-4xl font-black text-emerald-700 mb-1">{stats.completed}</div>
          <div className="text-xs text-gray-500 mb-3">Successfully finished</div>
          <div className="h-1.5 w-full bg-emerald-200/50 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${getPct(stats.completed)}%` }}></div>
          </div>
          <div className="text-[11px] text-gray-400">{getPct(stats.completed)}% of total</div>
        </div>

        {/* OVERDUE (Full Width) */}
        <div className="col-span-1 md:col-span-2 bg-red-50 rounded-xl border border-red-100 p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 shadow-sm">
          <div>
            <AlertTriangle className="w-8 h-8 text-red-600 opacity-25 mb-2 block" />
            <div className="text-[10px] tracking-widest font-bold uppercase text-red-600 mb-1">Overdue</div>
            <div className="text-5xl font-black text-red-600">{stats.overdue}</div>
          </div>
          <div className="flex-1 w-full">
            <div className="text-sm text-gray-600 mb-3 font-medium">
              {stats.overdue > 0 ? "Immediate action required for overdue tasks." : "No overdue tasks — you're all caught up!"}
            </div>
            <div className="h-1.5 w-full bg-red-200/50 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-red-600 rounded-full transition-all duration-500" style={{ width: `${getPct(stats.overdue)}%` }}></div>
            </div>
            <div className="text-[11px] text-gray-400">{getPct(stats.overdue)}% of total</div>
          </div>
        </div>
      </div>

      {/* SUMMARY PROGRESS BAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
        <div className="text-[11px] tracking-widest text-gray-400 uppercase mb-3 font-semibold">Task Breakdown</div>
        <div className="flex h-2.5 rounded-full overflow-hidden mb-4 bg-gray-100">
          <div className="bg-emerald-600 transition-all duration-500" style={{ width: `${getPct(stats.completed)}%` }}></div>
          <div className="bg-blue-600 transition-all duration-500" style={{ width: `${getPct(stats.inProgress)}%` }}></div>
          <div className="bg-orange-500 transition-all duration-500" style={{ width: `${getPct(stats.pending)}%` }}></div>
          <div className="bg-red-600 transition-all duration-500" style={{ width: `${getPct(stats.overdue)}%` }}></div>
        </div>
        
        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div> Completed ({stats.completed})
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> In Progress ({stats.inProgress})
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Pending ({stats.pending})
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div> Overdue ({stats.overdue})
          </div>
        </div>
      </div>

      {/* STAFF ACTIVITY SECTION */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="text-[11px] tracking-widest text-gray-400 uppercase mb-4 font-semibold">Staff Task Activity</div>
        
        {staffData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="pb-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">In Progress</th>
                  <th className="pb-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="pb-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="pb-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {staffData.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          {staff.name === "Unassigned" ? <AlertTriangle className="w-4 h-4" /> : <UserCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${staff.name === "Unassigned" ? "text-red-500" : "text-gray-800"}`}>
                            {staff.name}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate max-w-[150px] sm:max-w-xs">{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${staff.inProgress > 0 ? "bg-blue-50 text-blue-600" : "text-gray-300"}`}>
                        {staff.inProgress}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${staff.completed > 0 ? "bg-emerald-50 text-emerald-600" : "text-gray-300"}`}>
                        {staff.completed}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${staff.pending > 0 ? "bg-orange-50 text-orange-600" : "text-gray-300"}`}>
                        {staff.pending}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${staff.overdue > 0 ? "bg-red-50 text-red-600 shadow-sm border border-red-100" : "text-gray-300"}`}>
                        {staff.overdue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No tasks found in the database.
          </div>
        )}
      </div>

    </div>
  );
}