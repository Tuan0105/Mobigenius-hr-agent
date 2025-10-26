"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "./button"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function SidePanel({ isOpen, onClose, title, children, className }: SidePanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Side Panel */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full max-w-6xl bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  )
}
