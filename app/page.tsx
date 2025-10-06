"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to HR Agent page by default
    router.push("/hr-agent")
  }, [router])

  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">MobiGenius HR</h1>
        <p className="text-muted-foreground">Đang chuyển hướng đến HR Agent...</p>
        </div>
    </div>
  )
}
