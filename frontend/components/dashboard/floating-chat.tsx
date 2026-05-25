"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, X, Send, Image as ImageIcon, Loader2, ChevronLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ChatUser {
  email: string;
  full_name: string;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedReceiver, setSelectedReceiver] = useState("") 
  
  // FIX: Dito ang state para sa dot
  const [hasUnread, setHasUnread] = useState(true)
  
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([])
  const [myEmail, setMyEmail] = useState("")
  const [myRole, setMyRole] = useState("")
  const [uploading, setUploading] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // FIX: Function para sa pag-click ng chat bubble
  const toggleChat = () => {
    if (!isOpen) {
      setHasUnread(false) // Nawawala ang dot pagkabukas
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const email = localStorage.getItem("email")?.toLowerCase().trim() || ""
    const role = localStorage.getItem("userRole") || "user"
    setMyEmail(email)
    setMyRole(role)

    const fetchUsers = async () => {
      if (role === "admin") {
        try {
          const res = await fetch("http://localhost:40241/users")
          const data = await res.json()
          
          if (Array.isArray(data)) {
            const staffMembers = data
              .filter((u: any) => u.role !== "admin")
              .map((u: any) => ({
                email: u.email,
                full_name: u.full_name || u.email.split('@')[0]
              }))
            setAvailableUsers(staffMembers)
          }
        } catch (err) {
          console.error("Failed to fetch registered users directory:", err)
        }
      } else {
        setAvailableUsers([{ email: "adminnnn01@gmail.com", full_name: "System Admin" }])
        setSelectedReceiver("adminnnn01@gmail.com")
      }
    }

    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !selectedReceiver || !myEmail) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [isOpen, selectedReceiver, myEmail])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:40241/messages?user1=${myEmail}&user2=${selectedReceiver}`)
      const data = await res.json()
      if (Array.isArray(data)) setMessages(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedReceiver) return

    try {
      const res = await fetch("http://localhost:40241/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_email: myEmail,
          receiver_email: selectedReceiver,
          message_text: newMessage.trim(),
          image_url: null
        }),
      })
      if (res.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedReceiver) return

    const formData = new FormData()
    formData.append("image", file)

    try {
      setUploading(true)
      const uploadRes = await fetch("http://localhost:40241/upload", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (uploadRes.ok && uploadData.image_url) {
        await fetch("http://localhost:40241/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender_email: myEmail,
            receiver_email: selectedReceiver,
            message_text: "Sent an image attachment",
            image_url: uploadData.image_url
          }),
        })
        fetchMessages()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const getDisplayName = (emailAddress: string) => {
    const user = availableUsers.find(u => u.email.toLowerCase() === emailAddress.toLowerCase());
    return user ? user.full_name : emailAddress.split('@')[0];
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col items-end family-sans">
      {isOpen && (
        <Card className="w-80 h-[450px] mb-4 flex flex-col shadow-2xl border border-border/60 bg-card overflow-hidden rounded-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-3 bg-primary text-primary-foreground flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              {selectedReceiver && myRole === "admin" && (
                <button 
                  onClick={() => setSelectedReceiver("")} 
                  className="hover:bg-primary-foreground/20 p-1 -ml-1 rounded-full transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {!selectedReceiver && <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-1" />}
              <p className="text-xs font-black uppercase tracking-wider truncate max-w-[180px]">
                {selectedReceiver ? getDisplayName(selectedReceiver) : "Messages"}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/10 p-1 rounded-full transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/60">
            {!selectedReceiver && myRole === "admin" ? (
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-2 tracking-wider">
                  Active Team Members
                </p>
                {availableUsers.map(user => (
                  <button
                    key={user.email}
                    onClick={() => setSelectedReceiver(user.email)}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-secondary/80 rounded-xl transition-all text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {getInitials(user.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-foreground">{user.full_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 space-y-2.5 h-full">
                {messages.map((msg) => {
                  const isMe = msg.sender_email.toLowerCase().trim() === myEmail.toLowerCase().trim()
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`p-2.5 rounded-xl max-w-[85%] text-xs shadow-sm font-medium leading-tight ${
                        isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-white border text-foreground rounded-bl-none"
                      }`}>
                        {msg.image_url ? (
                          <div className="space-y-1">
                            <img src={`http://localhost:40241${msg.image_url}`} alt="Attach" className="rounded max-h-32 object-cover" />
                            <p className="text-[10px] opacity-80 italic">{msg.message_text}</p>
                          </div>
                        ) : (
                          msg.message_text
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {selectedReceiver && (
            <form onSubmit={handleSendMessage} className="p-2 border-t bg-card flex items-center gap-1.5">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button 
                type="button" 
                disabled={uploading} 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition shrink-0"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Aa"
                className="flex-1 bg-secondary/50 border-0 outline-none rounded-xl px-4 py-2 text-xs font-medium focus:ring-1 focus:ring-primary/30"
              />
              <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition shrink-0 disabled:opacity-50">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </Card>
      )}

      <button
        onClick={toggleChat} // FIX: Dito tinatawag yung toggle function
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </div>
        )}
      </button>
    </div>
  )
}