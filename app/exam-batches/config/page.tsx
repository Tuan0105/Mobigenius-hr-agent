"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Clock, Edit, FileText, Plus, Settings, Trash2, Users } from "lucide-react"
import { useState } from "react"

interface ExamTemplate {
  id: string
  name: string
  description: string
  duration: number // minutes
  questions: number
  passingScore: number
  isActive: boolean
  createdAt: string
}

// Mock data for exam templates
const mockExamTemplates: ExamTemplate[] = [
  {
    id: "1",
    name: "Thi kỹ năng IT - Frontend",
    description: "Bài thi đánh giá kỹ năng lập trình Frontend (React, Vue, Angular)",
    duration: 120,
    questions: 50,
    passingScore: 70,
    isActive: true,
    createdAt: "2024-10-20T10:00:00Z"
  },
  {
    id: "2", 
    name: "Thi kỹ năng IT - Backend",
    description: "Bài thi đánh giá kỹ năng lập trình Backend (Node.js, Python, Java)",
    duration: 150,
    questions: 60,
    passingScore: 75,
    isActive: true,
    createdAt: "2024-10-22T14:00:00Z"
  },
  {
    id: "3",
    name: "Thi kỹ năng Quản lý",
    description: "Bài thi đánh giá kỹ năng quản lý dự án và lãnh đạo",
    duration: 90,
    questions: 40,
    passingScore: 65,
    isActive: false,
    createdAt: "2024-10-25T09:00:00Z"
  }
]

export default function ExamBatchConfigPage() {
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>(mockExamTemplates)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ExamTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    duration: 120,
    questions: 50,
    passingScore: 70
  })

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      })
      return
    }

    const template: ExamTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      duration: newTemplate.duration,
      questions: newTemplate.questions,
      passingScore: newTemplate.passingScore,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    setExamTemplates(prev => [...prev, template])
    setNewTemplate({
      name: "",
      description: "",
      duration: 120,
      questions: 50,
      passingScore: 70
    })
    setIsCreateModalOpen(false)
    
    toast({
      title: "Tạo mẫu thi thành công",
      description: `Đã tạo mẫu thi "${template.name}"`,
    })
  }

  const handleEditTemplate = (template: ExamTemplate) => {
    setSelectedTemplate(template)
    setIsEditModalOpen(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    setExamTemplates(prev => prev.filter(t => t.id !== templateId))
    toast({
      title: "Xóa mẫu thi thành công",
      description: "Đã xóa mẫu thi khỏi hệ thống",
    })
  }

  const handleToggleActive = (templateId: string) => {
    setExamTemplates(prev => 
      prev.map(t => 
        t.id === templateId 
          ? { ...t, isActive: !t.isActive }
          : t
      )
    )
    toast({
      title: "Cập nhật trạng thái thành công",
      description: "Đã cập nhật trạng thái mẫu thi",
    })
  }

  return (
    <ProtectedRoute allowedRoles={['hr']}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Cấu hình Đợt thi</h1>
                  <p className="text-sm text-muted-foreground mt-1">Quản lý mẫu thi và cấu hình hệ thống</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tạo mẫu thi mới
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Tạo mẫu thi mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Tên mẫu thi *</Label>
                        <Input
                          id="name"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="VD: Thi kỹ năng IT - Frontend"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Mô tả *</Label>
                        <Textarea
                          id="description"
                          value={newTemplate.description}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Mô tả chi tiết về mẫu thi..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration">Thời gian (phút)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={newTemplate.duration}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) || 120 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="questions">Số câu hỏi</Label>
                          <Input
                            id="questions"
                            type="number"
                            value={newTemplate.questions}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, questions: parseInt(e.target.value) || 50 }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="passingScore">Điểm đạt (0-100)</Label>
                        <Input
                          id="passingScore"
                          type="number"
                          min="0"
                          max="100"
                          value={newTemplate.passingScore}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                          Hủy
                        </Button>
                        <Button onClick={handleCreateTemplate}>
                          Tạo mẫu thi
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid gap-6">
                {/* Exam Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Mẫu thi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {examTemplates.map((template) => (
                        <div key={template.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{template.name}</h3>
                                <Badge variant={template.isActive ? "default" : "secondary"}>
                                  {template.isActive ? "Hoạt động" : "Tạm dừng"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{template.duration} phút</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span>{template.questions} câu</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>Đạt: {template.passingScore}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(template.id)}
                                className={template.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                              >
                                {template.isActive ? "Tạm dừng" : "Kích hoạt"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Cài đặt hệ thống
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-base font-medium">Thời gian mặc định cho đợt thi</Label>
                          <p className="text-sm text-muted-foreground mt-1">Thời gian mặc định khi tạo đợt thi mới</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Input type="number" defaultValue="120" className="w-20" />
                            <span className="text-sm text-muted-foreground">phút</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-base font-medium">Số lượng tối đa ứng viên/đợt</Label>
                          <p className="text-sm text-muted-foreground mt-1">Giới hạn số lượng ứng viên trong một đợt thi</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Input type="number" defaultValue="50" className="w-20" />
                            <span className="text-sm text-muted-foreground">người</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button>
                          <Settings className="h-4 w-4 mr-2" />
                          Lưu cài đặt
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

