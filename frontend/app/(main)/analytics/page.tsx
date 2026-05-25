"use client"

import { useEffect, useState } from "react"
import { 
  BarChart3, CheckCircle2, AlertTriangle, Clock, Layers, 
  RefreshCw, Award, Users, TrendingUp 
} from "lucide-react"

interface AnalyticsStats {
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  total: number;
}

export default function OjtAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({ pending: 0, in_progress: 0, completed: 0, overdue: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:40241/analytics/stats")
      const data = await res.json()
      if (data) {
        setStats({
          pending: data.pending || 0,
          in_progress: data.in_progress || 0,
          completed: data.completed || 0,
          overdue: data.overdue || 0,
          total: data.total || 0
        })
      }
    } catch (err) {
      console.error("Failed to fetch OJT task stats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Madaling Computations para sa OJT Defense Presentation
  const taskCompletionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 px-2 family-sans">
      
      {/* Simple Student Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Task Analytics Report</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            OJT Project Module: Summary and tracking of branch performance metrics.
          </p>
        </div>

        <button onClick={fetchStats} className="w-fit flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition active:scale-95">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* 4 Main Summary Cards (Simple at Direkta ang Pangalan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks Created</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : stats.total}</h3>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress Tasks</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{loading ? "..." : stats.in_progress}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{loading ? "..." : stats.completed}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overdue Tasks</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">{loading ? "..." : stats.overdue}</h3>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Main Analysis Body split into 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Monthly Performance (Simple Clean Bar Design) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Monthly Project Progress</h3>
            <p className="text-xs text-slate-400">Record of assigned branch assignments per month.</p>
          </div>

          <div className="space-y-4">
            {[
              { month: "January Period", tasks: 45, percentage: 85, color: "bg-indigo-600" },
              { month: "February Period", tasks: 52, percentage: 70, color: "bg-indigo-600" },
              { month: "March Period", tasks: 48, percentage: 90, color: "bg-indigo-600" },
              { month: "April Period (Current)", tasks: 14, percentage: 60, color: "bg-emerald-500" }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-700">{item.month}</span>
                  <span className="text-slate-900 font-bold">{item.tasks} Tasks ({item.percentage}% Done)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full`} 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Simple OJT Project Note Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex gap-3">
            <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              <span className="font-bold text-slate-800 block mb-0.5"> Implementation Note:</span>
             branch monitoring is active. Please cross-reference the <span className="font-bold text-indigo-600">Monitor Page</span> to approve pending tasks or clear out the {stats.overdue} overdue items to maintain workspace productivity balance.
            </div>
          </div>
        </div>

        {/* Right Card: Simplified System Statistics */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">System Overview</h3>
            <p className="text-xs text-slate-400">Key metrics calculated from live database items.</p>
          </div>

          {/* Clean Simplified Completion Rate Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
              {taskCompletionPercentage}%
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Task Completion Rate</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">
                Percentage of total assigned work that is fully approved and completed.
              </p>
            </div>
          </div>

          {/* Simple Live Counter Items List */}
          <div className="space-y-2.5 pt-2">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Workspace Breakdown</p>
            
            <div className="flex justify-between items-center text-xs p-2.5 border border-slate-100 bg-white rounded-lg">
              <span className="text-slate-600 font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> In Progress
              </span>
              <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border">{stats.in_progress} Tasks</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 border border-slate-100 bg-white rounded-lg">
              <span className="text-slate-600 font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Pending Review
              </span>
              <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border">{stats.pending} Tasks</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 border border-slate-100 bg-white rounded-lg">
              <span className="text-slate-600 font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Overdue Tasks
              </span>
              <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border">{stats.overdue} Tasks</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}