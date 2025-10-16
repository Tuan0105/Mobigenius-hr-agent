import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { Inter, Open_Sans, Roboto } from "next/font/google"
import type React from "react"
import { Suspense } from "react"
import "./globals.css"

// Configure fonts for Vietnamese text
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-open-sans",
  display: "swap",
})

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MobiGenius - HR Agent",
  description: "Hệ thống quản lý tuyển dụng thông minh",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="light">
      <body className={`${openSans.variable} ${inter.variable} ${roboto.variable} font-open-sans antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
