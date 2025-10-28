"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('hr' | 'bpcm')[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // COMMENTED OUT FOR DEVELOPMENT - Skip authentication check
    // if (!isAuthenticated) {
    //   router.push("/login")
    //   return
    // }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate page based on role
      if (user.role === 'hr') {
        router.push("/hr-agent")
      } else if (user.role === 'bpcm') {
        router.push("/bpcm")
      }
      return
    }

    // Auto-redirect based on role and current path
    if (user) {
      if (user.role === 'hr' && pathname === '/bpcm') {
        router.push("/hr-agent")
      } else if (user.role === 'bpcm' && (pathname === '/hr-agent' || pathname === '/config')) {
        router.push("/bpcm")
      }
    }
  }, [isAuthenticated, user, router, pathname, allowedRoles])

  // COMMENTED OUT FOR DEVELOPMENT - Always render children
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Đang chuyển hướng...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return <>{children}</>
}
