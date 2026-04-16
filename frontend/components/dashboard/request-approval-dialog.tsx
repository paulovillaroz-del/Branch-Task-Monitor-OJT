"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Send, Clock } from "lucide-react"

interface RequestApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  taskTitle: string;
}

export function RequestApprovalDialog({ open, onOpenChange, onConfirm, taskTitle }: RequestApprovalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
  className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-[92vw] max-w-[400px] bg-background rounded-2xl border shadow-2xl !translate-x-0 !translate-y-0 !left-0 !top-0 m-auto outline-none"
>
  <div className="w-full flex flex-col items-center">
    <DialogHeader className="flex flex-col items-center text-center w-full">
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
        <Clock className="w-6 h-6" />
      </div>
      <DialogTitle className="text-xl font-bold tracking-tight">Submit for Review?</DialogTitle>
      <DialogDescription className="pt-2 text-sm leading-relaxed">
        You are requesting the Admin to approve <span className="font-bold text-foreground">"{taskTitle}"</span>. 
      </DialogDescription>
    </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="font-bold order-2 sm:order-1"
            >
              Not yet
            </Button>
            <Button 
              onClick={onConfirm} 
              className="bg-emerald-600 hover:bg-emerald-700 font-bold px-6 order-1 sm:order-2 shadow-lg shadow-emerald-200"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}