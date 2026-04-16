"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { X, Folder, Calendar, Pencil, Trash2, User, MessageSquare, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditTaskDialog } from "./edit-task-dialog"
import { RequestApprovalDialog } from "./request-approval-dialog"
import { TaskComments } from "./task-comments"
import { cn } from "@/lib/utils"

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  assigned_to?: string;
  is_requesting_approval?: boolean;
  feedback?: string;
}

interface ProjectListProps {
  tasks: Task[];
  isEditable?: boolean; 
  onTaskUpdated?: () => void;
}

export function ProjectList({ tasks = [], isEditable = false, onTaskUpdated }: ProjectListProps) {
  const [cyclingId, setCyclingId] = useState<number | null>(null);
  const [expandedChatId, setExpandedChatId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [activeTaskForRequest, setActiveTaskForRequest] = useState<Task | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
    setUserEmail(localStorage.getItem("email")); 
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (role === 'admin') return true; 
    const storageEmail = localStorage.getItem("email") || userEmail || "";
    const currentSessionEmail = storageEmail.toLowerCase().trim().replace(/f+/g, 'f');
    const taskAssignee = (task.assigned_to || "").toLowerCase().trim().replace(/f+/g, 'f');
    if (!currentSessionEmail || !taskAssignee) return false;
    return taskAssignee === currentSessionEmail; 
  });

  const refresh = () => onTaskUpdated?.();

  const getNextStatus = (currentStatus: string) => {
    const statuses = ['pending', 'in-progress', 'completed'];
    const current = currentStatus.toLowerCase().replace(" ", "-");
    const currentIndex = statuses.indexOf(current);
    return statuses[(currentIndex + 1) % statuses.length];
  };

  const handleUpdateStatus = async (id: number, status: string, requesting: boolean) => {
    try {
      const res = await fetch(`http://localhost:8080/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, is_requesting_approval: requesting }),
      });
      if (res.ok) {
        setCyclingId(null); 
        refresh(); 
      }
    } catch (err) { 
      console.error("Network error:", err); 
    }
  };

  const initiateStatusChange = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    if (task.status.toLowerCase() === 'completed' || task.is_requesting_approval) return; 
    if (role === "admin") {
      setCyclingId(task.id);
    } else {
      setActiveTaskForRequest(task);
      setRequestDialogOpen(true);
    }
  };

  const handleConfirmApprovalRequest = async () => {
    if (!activeTaskForRequest) return;
    try {
      const res = await fetch(`http://localhost:8080/tasks/${activeTaskForRequest.id}/request-approval`, {
        method: 'PATCH',
      });
      if (res.ok) refresh();
    } catch (err) { console.error(err); }
    setRequestDialogOpen(false);
  };

  const handleAdminDecision = async (id: number, action: string) => {
    try {
      const res = await fetch(`http://localhost:8080/tasks/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }), 
      });
      if (res.ok) {
        refresh(); 
      }
    } catch (err) { 
      console.error("Approval error:", err); 
    }
  };

  const getStatusStyles = (status: string, endDate: string, isRequesting: boolean) => {
    if (isRequesting) return 'bg-amber-500 text-white border-none animate-pulse';
    const isOverdue = endDate && new Date(endDate) < new Date() && status !== 'completed';
    if (isOverdue) return 'bg-red-500/10 text-red-500 border-red-500/20';
    
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground bg-secondary/5">
          <Folder className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">No tasks found.</p>
        </div>
      ) : (
        filteredTasks.map((task) => {
          const isCompleted = task.status.toLowerCase() === 'completed';
          const isOverdue = task.end_date && new Date(task.end_date) < new Date() && !isCompleted;
          const isChatOpen = expandedChatId === task.id;
          const isRequesting = !!task.is_requesting_approval;
          const nextStatus = getNextStatus(task.status);
          
          const sMail = (userEmail || localStorage.getItem("email") || "").toLowerCase().trim().replace(/f+/g, 'f');
          const tMail = (task.assigned_to || "").toLowerCase().trim().replace(/f+/g, 'f');
          const isMine = tMail === sMail;

          // PRIVACY LOGIC: Only Admin or the Assigned Staff can see/open the chat
          const canCommunicate = role === "admin" || isMine;

          return (
            <div key={task.id} className={cn(
              "group flex flex-col rounded-xl border bg-card transition-all overflow-hidden",
              isRequesting ? 'border-amber-500 shadow-md' : 'border-border/50'
            )}>
              <div className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Folder className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm truncate text-foreground">{task.title}</p>
                    {isMine && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">Assigned to Me</Badge>}
                    {isRequesting && <Badge className="bg-amber-500 text-[9px] uppercase font-black animate-pulse">Approval Required</Badge>}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{task.description}</p>

                  <div className="flex items-center gap-x-4 text-[10px] text-muted-foreground font-semibold">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /><span>Due: {task.end_date}</span></div>
                    <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /><span>{task.assigned_to}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* COMMUNICATION BUTTON - PROTECTED BY PRIVACY LOGIC */}
                  {canCommunicate && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8 transition-colors", isChatOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary")}
                      onClick={() => setExpandedChatId(isChatOpen ? null : task.id)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  )}

                  {role === "admin" && !isCompleted && !isRequesting && cyclingId !== task.id && (
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => setEditingTask(task)}><Pencil className="w-4 h-4" /></Button>
                    </div>
                  )}

                  {cyclingId === task.id ? (
                    <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-lg border border-emerald-200">
                      <Button size="sm" className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(task.id, nextStatus, false)}>CONFIRM</Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCyclingId(null)}><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <Badge 
                      className={`${getStatusStyles(task.status, task.end_date, isRequesting)} capitalize py-1.5 px-3 cursor-pointer`}
                      onClick={(e) => initiateStatusChange(e, task)}
                    >
                      {isRequesting ? 'Review Needed' : (isCompleted ? '✓ Completed' : (isOverdue ? '⚠️ Overdue' : task.status))}
                    </Badge>
                  )}
                </div>
              </div>

              {/* ADMIN ACTION PANEL */}
              {role === "admin" && isRequesting && (
                <div className="bg-amber-50 border-t border-amber-100 p-3 flex items-center justify-between animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase">Staff is requesting approval</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAdminDecision(task.id, 'reject')}>REJECT</Button>
                    <Button size="sm" className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAdminDecision(task.id, 'approve')}>APPROVE</Button>
                  </div>
                </div>
              )}

              {/* COMMUNICATION AREA - ONLY ACCESSIBLE IF AUTHORIZED */}
              {isChatOpen && canCommunicate && (
                <div className="border-t border-border/40 bg-secondary/5 animate-in slide-in-from-top-2">
                  <TaskComments taskId={task.id} currentUserEmail={userEmail || ""} />
                </div>
              )}
            </div>
          )
        })
      )}

      <RequestApprovalDialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen} onConfirm={handleConfirmApprovalRequest} taskTitle={activeTaskForRequest?.title || ""} />
      {editingTask && <EditTaskDialog task={editingTask} open={!!editingTask} setOpen={() => setEditingTask(null)} onTaskUpdated={refresh} />}
    </div>
  )
}