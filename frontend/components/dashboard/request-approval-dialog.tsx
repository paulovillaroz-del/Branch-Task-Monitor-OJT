"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, Send } from "lucide-react"

interface RequestApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  taskTitle: string;
}

export function RequestApprovalDialog({ open, onOpenChange, onConfirm, taskTitle }: RequestApprovalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Napanatili ang w-full max-w-md para maging compact at maganda ang sukat */}
      <DialogContent className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 gap-0 text-center animate-in zoom-in-95 duration-200">
        
        {/* Inilagay sa loob ng DialogHeader ang title para masunod ang accessibility rule ng Radix */}
        <DialogHeader className="space-y-0">
          {/* Center Warning/Clock Icon */}
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-sm mb-4">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>

          {/* 🔴 THE CRITICAL FIX: Ginamit natin ang DialogTitle para mawala ang Console Error */}
          <DialogTitle className="text-base font-black text-slate-900 tracking-tight text-center">
            Submit for Review?
          </DialogTitle>
        </DialogHeader>

        {/* Modal Description Body Context */}
        <div className="mt-2 mb-6">
          <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">
            You are requesting the Administration to audit and approve the task: <span className="font-bold text-slate-800">"{taskTitle}"</span>.
          </p>
        </div>

        {/* Action Buttons arranged perfectly */}
        <div className="flex items-center justify-center gap-3 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition h-9 active:scale-95"
          >
            Not yet
          </Button>
          
          <Button 
            type="button" 
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition h-9 shadow-md shadow-emerald-100 active:scale-95 border-0"
          >
            <Send className="w-3.5 h-3.5" />
            Send Request
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}