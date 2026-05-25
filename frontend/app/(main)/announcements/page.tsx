"use client"

import { useState, useEffect } from "react"
import { Megaphone, AlertCircle, Info, Sparkles, Send, Loader2, Trash2 } from "lucide-react"

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  posted_by: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")

  // Form States para kay Admin
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState("info")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "user")
    setUserEmail(localStorage.getItem("email") || "Admin")
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("http://localhost:40241/announcements")
      const data = await res.json()
      if (Array.isArray(data)) setAnnouncements(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setIsSubmitting(true)

    try {
      const res = await fetch("http://localhost:40241/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          priority,
          posted_by: userEmail
        }),
      })

      if (res.ok) {
        setTitle("")
        setContent("")
        setPriority("info")
        fetchAnnouncements() 
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // New function para burahin ang anunsyo
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    try {
      const res = await fetch(`http://localhost:40241/announcements/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchAnnouncements() // I-refresh agad ang feed pagkabura
      } else {
        alert("Failed to delete the announcement.")
      }
    } catch (err) {
      console.error("Error deleting announcement:", err)
    }
  }

  const getPriorityStyles = (prio: string) => {
    if (prio === "urgent") return { icon: <AlertCircle className="w-5 h-5 text-red-600" />, bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700" }
    if (prio === "update") return { icon: <Sparkles className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700" }
    return { icon: <Info className="w-5 h-5 text-slate-600" />, bg: "bg-white border-slate-200", badge: "bg-slate-100 text-slate-700" }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(dateStr))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 mt-6 family-sans">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-indigo-600" />
          Company Announcements
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Official memos, system updates, and urgent notices from the administration.
        </p>
      </div>

      {/* Admin Post Editor (Role = admin) */}
      {userRole === "admin" && (
        <form onSubmit={handlePost} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              AD
            </div>
            <span className="text-sm font-bold text-slate-700">Post new memo </span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-3">
            <input 
              type="text" 
              placeholder="Announcement Title" 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="md:col-span-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
            <select 
              value={priority} onChange={(e) => setPriority(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer"
            >
              <option value="info">General Info</option>
              <option value="update">System Update</option>
              <option value="urgent">Urgent Notice</option>
            </select>
          </div>
          
          <textarea 
            placeholder="Type the full details here..." 
            value={content} onChange={(e) => setContent(e.target.value)}
            className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
            required
          />
          
          <div className="flex justify-end">
            <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95 disabled:opacity-70">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish Memo
            </button>
          </div>
        </form>
      )}

      {/* Announcements Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading memos...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl border border-dashed border-slate-300">
            <Megaphone className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">No announcements yet</p>
          </div>
        ) : (
          announcements.map((memo) => {
            const styles = getPriorityStyles(memo.priority)
            return (
              <div key={memo.id} className={`p-5 rounded-2xl border ${styles.bg} shadow-sm relative overflow-hidden transition-all hover:shadow-md`}>
                {memo.priority === "urgent" && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full border shadow-sm">{styles.icon}</div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">{memo.title}</h3>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Posted by {memo.posted_by.split('@')[0]} • {formatDate(memo.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${styles.badge}`}>
                      {memo.priority}
                    </span>
                    
                    {/* 🔴 DELETE BUTTON: Lalabas lang kapag Admin ang naka-login */}
                    {userRole === "admin" && (
                      <button
                        onClick={() => handleDelete(memo.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-slate-700 leading-relaxed pl-14 whitespace-pre-wrap">
                  {memo.content}
                </p>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}