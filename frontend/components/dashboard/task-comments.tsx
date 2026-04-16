"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User } from "lucide-react"

export function TaskComments({ taskId, currentUserEmail }: { taskId: number, currentUserEmail: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")

  const fetchComments = async () => {
    const res = await fetch(`http://localhost:8080/tasks/${taskId}/comments`)
    if (res.ok) setComments(await res.json())
  }

  useEffect(() => { fetchComments() }, [taskId])

  const sendComment = async () => {
    if (!newComment.trim()) return
    const res = await fetch(`http://localhost:8080/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_email: currentUserEmail, message: newComment })
    })
    if (res.ok) {
      setNewComment("")
      fetchComments()
    }
  }

  return (
    <div className="mt-4 border-t pt-4 bg-slate-50/50 rounded-b-xl p-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Internal Discussion</p>
      
      <div className="space-y-3 max-h-40 overflow-y-auto mb-4 px-1">
        {comments.map((c) => (
          <div key={c.id} className={`flex flex-col ${c.sender === currentUserEmail ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-2 rounded-lg text-xs ${
              c.sender === currentUserEmail ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'
            }`}>
              {c.message}
            </div>
            <span className="text-[8px] text-slate-400 mt-1">{c.sender === currentUserEmail ? 'You' : 'Admin'}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input 
          placeholder="Write a private note..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="h-8 text-xs bg-white"
          onKeyDown={(e) => e.key === 'Enter' && sendComment()}
        />
        <Button size="sm" onClick={sendComment} className="h-8 bg-emerald-600 hover:bg-emerald-700">
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}