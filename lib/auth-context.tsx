"use client"

import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  user: { username: string; email: string; role: 'hr' | 'bpcm' } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedAuth = localStorage.getItem("auth")
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      setIsAuthenticated(true)
      setUser(authData.user)
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    // Check credentials
    if (username === "hragent" && password === "1") {
      const userData = {
        username: "hragent",
        email: "hragent@mobifone.vn",
        role: "hr" as const
      }
      
      setIsAuthenticated(true)
      setUser(userData)
      
      // Save to localStorage
      localStorage.setItem("auth", JSON.stringify({
        isAuthenticated: true,
        user: userData
      }))
      
      // Redirect to HR page
      router.push("/hr-agent")
      return true
    } else if (username === "bpcm" && password === "1") {
      const userData = {
        username: "bpcm",
        email: "bpcm@mobifone.vn",
        role: "bpcm" as const
      }
      
      setIsAuthenticated(true)
      setUser(userData)
      
      // Save to localStorage
      localStorage.setItem("auth", JSON.stringify({
        isAuthenticated: true,
        user: userData
      }))
      
      // Redirect to BPCM page
      router.push("/bpcm")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem("auth")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
