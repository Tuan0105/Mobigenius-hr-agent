"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberPassword, setRememberPassword] = useState(false)
  const [username, setUsername] = useState("hragent")
  const [password, setPassword] = useState("")
  const { login } = useAuth()

  const handleLogin = () => {
    if (!username || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu",
        variant: "destructive",
      })
      return
    }

    const success = login(username, password)
    if (!success) {
      toast({
        title: "Đăng nhập thất bại",
        description: "Tên đăng nhập hoặc mật khẩu không đúng",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn đến với MobiGenius HR",
      })
    }
  }

  const handleGoogleLogin = () => {
    // TODO: Implement Google login logic
    console.log("Google login clicked")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-400/10 rounded-lg rotate-45 blur-lg"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-400/10 rounded-lg rotate-12 blur-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hãy gặp gỡ trợ lý ảo của riêng bạn !
          </h1>
          <p className="text-lg text-blue-100 max-w-md mx-auto">
            Đặt câu hỏi hay yêu cầu trợ giúp. Đây là Trợ lý ảo dành riêng cho bạn, luôn sẵn sàng hỗ trợ mỗi khi bạn cần.
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">MobiGenius</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Tên đăng nhập *
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  placeholder="Nhập mật khẩu"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Password */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberPassword}
                onCheckedChange={(checked) => setRememberPassword(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Ghi nhớ mật khẩu
              </Label>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
            >
              Đăng nhập
            </Button>

            {/* Separator */}
            <div className="relative">
              <Separator className="my-6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">Hoặc đăng nhập với</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                Đăng nhập bằng Google
              </div>
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
            {/* Registration Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Bạn chưa có tài khoản?{" "}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Đăng ký
                </button>
              </span>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                Hệ thống quản lý AI Chatbot
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p><strong>HR Agent:</strong> hragent / 1</p>
                <p><strong>BPCM:</strong> bpcm / 1</p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
