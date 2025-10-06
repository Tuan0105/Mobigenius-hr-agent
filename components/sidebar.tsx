"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BarChart3, Brain, ChevronDown, ChevronRight, FileText, Users } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAgenticExpanded, setIsAgenticExpanded] = useState(true)
  const [isManagementExpanded, setIsManagementExpanded] = useState(false)
  const [isReportsExpanded, setIsReportsExpanded] = useState(false)

  return (
    <div className={cn("flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Brain className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">MobiGenius</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {/* Agentic AI Section */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setIsAgenticExpanded(!isAgenticExpanded)}
          >
            <span className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Agentic AI
            </span>
            {isAgenticExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          {isAgenticExpanded && (
            <div className="ml-6 space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  pathname === "/" || pathname === "/hr-agent"
                    ? "text-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                onClick={() => router.push("/hr-agent")}
              >
                <Users className="mr-2 h-4 w-4" />
                HR Agent
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => router.push("/data-agent")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Data Agent
                {/* <span className="ml-auto rounded bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                  NEW
                </span> */}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => router.push("/deep-research")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Deep Research
                {/* <span className="ml-auto rounded bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                  NEW
                </span> */}
              </Button>
            </div>
          )}
        </div>

        {/* Management Section */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setIsManagementExpanded(!isManagementExpanded)}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Quản lý
            </span>
            {isManagementExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          {isManagementExpanded && (
            <div className="ml-6 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => router.push("/management-registration")}
              >
                <Users className="mr-2 h-4 w-4" />
                Quản lý đăng ký
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => router.push("/management-integration")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Quản lý tích hợp
              </Button>
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setIsReportsExpanded(!isReportsExpanded)}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Báo cáo
            </span>
            {isReportsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          {isReportsExpanded && (
            <div className="ml-6 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => router.push("/log-monitoring")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Giám sát log
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground">Tuấn</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">tuấn@mobifone.vn</p>
          </div>
        </div>
      </div>
    </div>
  )
}
