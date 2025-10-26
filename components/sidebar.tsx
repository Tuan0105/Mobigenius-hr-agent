"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Brain, Calendar, LogOut, Settings, Users } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout, user } = useAuth()

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
        {/* HR Management Section */}
        <div className="space-y-1">
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
            Quản lý Tuyển dụng
          </Button>
        </div>

        {/* Exam Management Section */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === "/exam-batches"
                ? "text-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            onClick={() => router.push("/exam-batches")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Quản lý Đợt thi
          </Button>
        </div>

        {/* Configuration Section */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === "/config"
                ? "text-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            onClick={() => router.push("/config")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Cấu hình
          </Button>
        </div>

      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.username || "HR Agent"}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email || "hragent@mobifone.vn"}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
