"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden hover:bg-secondary transition-all duration-300"
        >
          <Menu className="w-6 h-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="p-0 w-64 border-r-0">
        {/* CRITICAL FIX: Screen readers need this Title to stop the error */}
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>

        {/* We wrap Sidebar in a div to ensure it doesn't try to use 
           fixed positioning inside the Sheet 
        */}
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}