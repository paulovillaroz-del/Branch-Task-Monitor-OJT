"use client"

import { useEffect, useState } from "react"
import { RefreshCw, X, FileText, ChevronRight, ChevronLeft, ShieldAlert, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditLog {
  id: number;
  action: string;
  performed_by: string;
  details: string;
  created_at: string;
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 10

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:40241/audit-logs")
      const data = await res.json()
      if (Array.isArray(data)) setLogs(data)
    } catch (err) {
      console.error("Failed to fetch audit logs", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.performed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage))
  const currentLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit"
    })
  }

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("created")) return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (act.includes("updated")) return "bg-blue-50 text-blue-700 border-blue-200"
    if (act.includes("deleted") || act.includes("rejected")) return "bg-rose-50 text-rose-700 border-rose-200"
    return "bg-slate-50 text-slate-600 border-slate-200"
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
      
      {/* Search Toolbar only (Wala na yung malaking header block) */}
      <div className="flex justify-end gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
        </div>
        <button onClick={fetchLogs} className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Summary</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 flex-1">
            {loading ? 
              <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">Fetching logs...</td></tr> 
              : currentLogs.map(log => (
                <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-slate-50 cursor-pointer group">
                  <td className="px-6 py-4 text-slate-500 font-medium">{formatDate(log.created_at)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>{log.action}</span></td>
                  <td className="px-6 py-4 font-bold text-slate-700">{log.performed_by.split('@')[0]}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{log.details}</td>
                  <td className="px-6 py-4 text-right"><ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-indigo-600" /></td>
                </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-auto flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <span className="text-xs font-bold text-slate-400 uppercase">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 bg-white border rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 bg-white border rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Modal Details */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-lg flex items-center gap-2"><FileText className="text-indigo-600" /> Log Details</h2>
              <button onClick={() => setSelectedLog(null)}><X className="text-slate-400" /></button>
            </div>
            <div className="bg-slate-900 text-emerald-400 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
              {selectedLog.details}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}