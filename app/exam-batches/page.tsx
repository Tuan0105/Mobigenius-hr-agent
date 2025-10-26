"use client"

import { CandidateDetailModal } from "@/components/candidate-detail-modal"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidePanel } from "@/components/ui/side-panel"
import { TableBody, TableCell, Table as TableComponent, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { useHRData } from "@/lib/data-store"
import type { ExamBatch } from "@/lib/types"
import { Calendar, CheckCircle, Download, Edit, FileText, MapPin, Monitor, Plus, Trash2, Upload, Users, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"


// Mock data for exam batches
const mockExamBatches: ExamBatch[] = [
  {
    id: "1",
    name: "Đợt thi Chuyên môn IT - 25/10/2024",
    examDate: "2024-10-25",
    format: "online",
    maxCandidates: 50,
    assignedCandidates: 4,
    status: "open",
    createdAt: "2024-10-20T10:00:00Z",
    updatedAt: "2024-10-20T10:00:00Z"
  },
  {
    id: "2", 
    name: "Đợt thi Kỹ thuật - 28/10/2024",
    examDate: "2024-10-28",
    format: "offline",
    location: "Tòa nhà A, Tầng 5",
    maxCandidates: 30,
    assignedCandidates: 4,
    status: "completed",
    createdAt: "2024-10-22T14:00:00Z",
    updatedAt: "2024-10-28T16:00:00Z"
  },
  {
    id: "3",
    name: "Đợt thi Quản lý - 30/10/2024", 
    examDate: "2024-10-30",
    format: "online",
    maxCandidates: 40,
    assignedCandidates: 4,
    status: "graded",
    createdAt: "2024-10-25T09:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z"
  }
]

export default function ExamBatchesPage() {
  const router = useRouter()
  const { updateCandidateStage, candidates } = useHRData()
  
  const [examBatches, setExamBatches] = useState<ExamBatch[]>(mockExamBatches)
  const [examCandidates, setExamCandidates] = useState<any[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [isViewCandidatesOpen, setIsViewCandidatesOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<ExamBatch | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false)
  const [newBatch, setNewBatch] = useState({
    name: "",
    examDate: "",
    format: "online" as "online" | "offline",
    location: "",
    maxCandidates: 50
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "graded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Đang mở"
      case "completed":
        return "Đã thi"
      case "graded":
        return "Đã có kết quả"
      default:
        return "Không xác định"
    }
  }

  const handleCreateBatch = () => {
    if (!newBatch.name || !newBatch.examDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      })
      return
    }

    const batch: ExamBatch = {
      id: Date.now().toString(),
      name: newBatch.name,
      examDate: newBatch.examDate,
      format: newBatch.format,
      location: newBatch.format === "offline" ? newBatch.location : undefined,
      maxCandidates: newBatch.maxCandidates,
      assignedCandidates: 0,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setExamBatches(prev => [...prev, batch])
    setNewBatch({
      name: "",
      examDate: "",
      format: "online",
      location: "",
      maxCandidates: 50
    })
    setIsCreateModalOpen(false)
    
    toast({
      title: "Tạo đợt thi thành công",
      description: `Đã tạo đợt thi "${batch.name}"`,
    })
  }

  const handleEditBatch = (batch: ExamBatch) => {
    setSelectedBatch(batch)
    setIsEditModalOpen(true)
  }

  const handleDeleteBatch = (batchId: string) => {
    setExamBatches(prev => prev.filter(b => b.id !== batchId))
    toast({
      title: "Xóa đợt thi thành công",
      description: "Đã xóa đợt thi khỏi hệ thống",
    })
  }

  const handleViewCandidates = (batch: ExamBatch) => {
    setSelectedBatch(batch)
    // Get real candidates assigned to this batch
    // Map batch ID to examBatchId format (e.g., "1" -> "batch-1")
    const batchId = `batch-${batch.id}`
    const batchCandidates = candidates
      .filter(c => c.examBatchId === batchId)
      .map(c => ({
        candidateId: c.id,
        candidateName: `${c.hoVaTenDem} ${c.ten}`,
        candidateEmail: c.email,
        position: c.viTri,
        assignedAt: c.updatedAt,
        examResult: c.stage === 'pass-test' ? 'pass' : c.stage === 'fail-test' ? 'fail' : undefined,
        examScore: c.score,
        notes: c.notes
      }))
    setExamCandidates(batchCandidates)
    setIsViewCandidatesOpen(true)
  }

  const handleCandidateClick = (candidate: any) => {
    // Find the full candidate data from the main candidates list
    const fullCandidate = candidates.find(c => c.id === candidate.candidateId)
    if (fullCandidate) {
      setSelectedCandidate(fullCandidate)
      setIsCandidateModalOpen(true)
    }
  }

  const handleInputResults = (batch: ExamBatch) => {
    setSelectedBatch(batch)
    // Get real candidates assigned to this batch
    // Map batch ID to examBatchId format (e.g., "1" -> "batch-1")
    const batchId = `batch-${batch.id}`
    const batchCandidates = candidates
      .filter(c => c.examBatchId === batchId)
      .map(c => ({
        candidateId: c.id,
        candidateName: `${c.hoVaTenDem} ${c.ten}`,
        candidateEmail: c.email,
        position: c.viTri,
        assignedAt: c.updatedAt,
        examResult: c.stage === 'pass-test' ? 'pass' : c.stage === 'fail-test' ? 'fail' : undefined,
        examScore: c.score,
        notes: c.notes
      }))
    setExamCandidates(batchCandidates)
    setIsResultModalOpen(true)
  }

  const handleImportResults = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simulate AI processing
    toast({
      title: "Đang xử lý file Excel...",
      description: "AI đang đọc và phân tích kết quả thi",
    })

    // Simulate processing time
    setTimeout(() => {
      // Mock AI processing results
      const updatedCandidates = examCandidates.map(candidate => ({
        ...candidate,
        examResult: Math.random() > 0.3 ? "pass" : "fail" as "pass" | "fail",
        examScore: Math.floor(Math.random() * 50) + 50,
        notes: "Kết quả được import từ Excel"
      }))

      setExamCandidates(updatedCandidates)

      // Update candidate stages in main HR system
      updatedCandidates.forEach(candidate => {
        if (candidate.examResult === "pass") {
          updateCandidateStage(candidate.candidateId, "pass-test")
        } else {
          updateCandidateStage(candidate.candidateId, "fail-test")
        }
      })

      toast({
        title: "Import thành công",
        description: `Đã import kết quả cho ${updatedCandidates.length} ứng viên và cập nhật trạng thái trong hệ thống`,
      })
    }, 2000)
  }

  const handleUpdateCandidateResult = (candidateId: number, result: "pass" | "fail", score: number) => {
    // Update exam candidates list
    setExamCandidates(prev => prev.map(c => 
      c.candidateId === candidateId 
        ? { ...c, examResult: result, examScore: score }
        : c
    ))
    
    // Update main candidates data
    const newStage = result === 'pass' ? 'pass-test' : 'fail-test'
    updateCandidateStage(candidateId, newStage as any)
  }

  const handleSaveResults = () => {
    // Update batch status to graded
    if (selectedBatch) {
      setExamBatches(prev => prev.map(b => 
        b.id === selectedBatch.id 
          ? { ...b, status: "graded" as const }
          : b
      ))
    }

    // Update candidate stages in main HR system based on exam results
    examCandidates.forEach(candidate => {
      if (candidate.examResult === "pass") {
        // Pass test - move to pass-test stage
        updateCandidateStage(candidate.candidateId, "pass-test")
      } else if (candidate.examResult === "fail") {
        // Fail test - move to fail-test stage  
        updateCandidateStage(candidate.candidateId, "fail-test")
      }
    })

    toast({
      title: "Lưu kết quả thành công",
      description: `Đã cập nhật kết quả thi cho ${examCandidates.length} ứng viên và cập nhật trạng thái trong hệ thống HR`,
    })

    setIsResultModalOpen(false)
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
                  <h1 className="text-2xl font-bold text-foreground">Quản lý Đợt thi</h1>
                  <p className="text-sm text-muted-foreground mt-1">Tạo và quản lý các đợt thi kỹ năng</p>
                </div>
                <div className="flex items-center gap-3">
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo đợt thi mới
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Tạo đợt thi mới</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Tên đợt thi *</Label>
                          <Input
                            id="name"
                            value={newBatch.name}
                            onChange={(e) => setNewBatch(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="VD: Đợt thi Chuyên môn IT - 25/10/2024"
                          />
                        </div>
                        <div>
                          <Label htmlFor="examDate">Ngày thi *</Label>
                          <Input
                            id="examDate"
                            type="date"
                            value={newBatch.examDate}
                            onChange={(e) => setNewBatch(prev => ({ ...prev, examDate: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="format">Hình thức</Label>
                          <Select value={newBatch.format} onValueChange={(value: "online" | "offline") => setNewBatch(prev => ({ ...prev, format: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="offline">Offline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {newBatch.format === "offline" && (
                          <div>
                            <Label htmlFor="location">Địa điểm</Label>
                            <Input
                              id="location"
                              value={newBatch.location}
                              onChange={(e) => setNewBatch(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="VD: Tòa nhà A, Tầng 5"
                            />
                          </div>
                        )}
                        <div>
                          <Label htmlFor="maxCandidates">Số lượng tối đa</Label>
                          <Input
                            id="maxCandidates"
                            type="number"
                            value={newBatch.maxCandidates}
                            onChange={(e) => setNewBatch(prev => ({ ...prev, maxCandidates: parseInt(e.target.value) || 50 }))}
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Hủy
                          </Button>
                          <Button onClick={handleCreateBatch}>
                            Tạo đợt thi
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách đợt thi</CardTitle>
                </CardHeader>
                <CardContent>
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên đợt thi</TableHead>
                        <TableHead>Ngày thi</TableHead>
                        <TableHead>Hình thức</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="w-32">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examBatches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">{batch.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(batch.examDate).toLocaleDateString('vi-VN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {batch.format === "online" ? (
                                <Monitor className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span>{batch.format === "online" ? "Online" : batch.location || "Offline"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{batch.assignedCandidates}/{batch.maxCandidates}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getStatusColor(batch.status)}`}>
                              {getStatusText(batch.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewCandidates(batch)}
                                className="gap-1"
                                title="Xem danh sách ứng viên"
                              >
                                <Users className="h-4 w-4" />
                                Xem ứng viên
                              </Button>
                              {batch.status === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleInputResults(batch)}
                                  className="gap-1"
                                >
                                  <FileText className="h-4 w-4" />
                                  Nhập kết quả
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditBatch(batch)}
                                title="Chỉnh sửa đợt thi"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    title="Xóa đợt thi"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xóa đợt thi?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc muốn xóa đợt thi "{batch.name}"? Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBatch(batch.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Xóa
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableComponent>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Result Input SidePanel */}
      <SidePanel
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Nhập kết quả thi - ${selectedBatch?.name}`}
      >
        <div className="space-y-6">
          {/* Import Excel Section */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Import kết quả từ Excel</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => document.getElementById('excel-import')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Chọn file Excel
                </Button>
                <input
                  id="excel-import"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportResults}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    // Download template
                    const templateData = "Tên,Email,Vị trí,Kết quả,Điểm\nNguyễn Văn A,nguyenvana@email.com,Frontend Developer,Đạt,85"
                    const blob = new Blob([templateData], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'template_ket_qua_thi.csv'
                    a.click()
                  }}
                >
                  <Download className="h-4 w-4" />
                  Tải template
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Tải template Excel, điền kết quả thi, sau đó import lại để AI tự động cập nhật kết quả.
            </p>
          </div>

          {/* Candidates List */}
          <div>
            <h3 className="font-medium mb-4">Danh sách ứng viên thi ({examCandidates.length} người)</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {examCandidates.map((candidate) => (
                <div key={candidate.candidateId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="space-y-3">
                    {/* Candidate Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-base">{candidate.candidateName}</h4>
                        <p className="text-sm text-muted-foreground">{candidate.candidateEmail}</p>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {candidate.examResult === "pass" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          candidate.examResult === "pass" ? "text-green-600" : "text-red-600"
                        }`}>
                          {candidate.examResult === "pass" ? "Đạt" : "Không đạt"}
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`result-${candidate.candidateId}`} className="text-sm font-medium">Kết quả:</Label>
                        <Select
                          value={candidate.examResult || ""}
                          onValueChange={(value: "pass" | "fail") => 
                            handleUpdateCandidateResult(candidate.candidateId, value, candidate.examScore || 0)
                          }
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pass">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Đạt
                              </div>
                            </SelectItem>
                            <SelectItem value="fail">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                Không đạt
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`score-${candidate.candidateId}`} className="text-sm font-medium">Điểm:</Label>
                        <Input
                          id={`score-${candidate.candidateId}`}
                          type="number"
                          min="0"
                          max="100"
                          value={candidate.examScore || ""}
                          onChange={(e) => 
                            handleUpdateCandidateResult(
                              candidate.candidateId, 
                              candidate.examResult || "fail", 
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`notes-${candidate.candidateId}`} className="text-sm font-medium">Ghi chú:</Label>
                        <Input
                          id={`notes-${candidate.candidateId}`}
                          placeholder="Ghi chú..."
                          value={candidate.notes || ""}
                          onChange={(e) => {
                            setExamCandidates(prev => prev.map(c => 
                              c.candidateId === candidate.candidateId 
                                ? { ...c, notes: e.target.value }
                                : c
                            ))
                          }}
                          className="w-full mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Trạng thái:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-3 h-3 rounded-full ${
                            candidate.examResult === "pass" ? "bg-green-500" : "bg-red-500"
                          }`} />
                          <span className="text-sm text-muted-foreground">
                            {candidate.examResult === "pass" ? "Đã hoàn thành" : "Chưa đạt"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background">
            <Button variant="outline" onClick={() => setIsResultModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveResults}>
              Lưu kết quả
            </Button>
          </div>
        </div>
      </SidePanel>

      {/* View Candidates SidePanel */}
      <SidePanel
        isOpen={isViewCandidatesOpen}
        onClose={() => setIsViewCandidatesOpen(false)}
        title="Danh sách ứng viên"
        description={`Đợt thi: ${selectedBatch?.name || ''}`}
      >
        <div className="space-y-4">
          {/* Batch Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tên đợt thi:</span>
                <p className="text-muted-foreground">{selectedBatch?.name}</p>
              </div>
              <div>
                <span className="font-medium">Ngày thi:</span>
                <p className="text-muted-foreground">
                  {selectedBatch?.examDate ? new Date(selectedBatch.examDate).toLocaleDateString('vi-VN') : ''}
                </p>
              </div>
              <div>
                <span className="font-medium">Hình thức:</span>
                <p className="text-muted-foreground">
                  {selectedBatch?.format === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
              <div>
                <span className="font-medium">Số lượng:</span>
                <p className="text-muted-foreground">
                  {examCandidates.length}/{selectedBatch?.maxCandidates} ứng viên
                </p>
              </div>
            </div>
          </div>

          {/* Candidates List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">Danh sách ứng viên</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {examCandidates.length} ứng viên
                </Badge>
              </div>
            </div>
            
            {examCandidates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Chưa có ứng viên</h4>
                <p className="text-sm text-muted-foreground">Chưa có ứng viên nào được gán vào đợt thi này</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {examCandidates.map((candidate, index) => (
                  <div key={candidate.candidateId} className="group relative bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200">
                    {/* Header with candidate info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 
                            className="font-semibold text-base text-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleCandidateClick(candidate)}
                            style={{ cursor: 'pointer' }}
                          >
                            {candidate.candidateName}
                          </h4>
                          <p className="text-sm text-muted-foreground">{candidate.candidateEmail}</p>
                          <p className="text-xs text-primary font-medium">{candidate.position}</p>
                        </div>
                      </div>
                      
                      {/* Result status */}
                      <div className="flex items-center gap-2">
                        {candidate.examResult ? (
                          <div className="flex items-center gap-2">
                            {candidate.examResult === 'pass' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <Badge className={`text-xs font-medium ${
                              candidate.examResult === 'pass' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {candidate.examResult === 'pass' ? 'Đạt' : 'Không đạt'}
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                            Chưa có kết quả
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Ngày gán:</span>
                        <p className="text-muted-foreground">
                          {new Date(candidate.assignedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      
                      {candidate.examScore && (
                        <div className="space-y-1">
                          <span className="font-medium text-foreground">Điểm số:</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted/50 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${candidate.examScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground">{candidate.examScore}/100</span>
                          </div>
                        </div>
                      )}
                      
                      {candidate.notes && (
                        <div className="md:col-span-2 space-y-1">
                          <span className="font-medium text-foreground">Ghi chú:</span>
                          <p className="text-muted-foreground bg-muted/30 rounded-lg p-2 text-sm">
                            {candidate.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover effect border */}
                    <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/20 transition-colors duration-200 pointer-events-none" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidePanel>

      {/* Edit Batch Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đợt thi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tên đợt thi</Label>
              <Input
                id="edit-name"
                value={selectedBatch?.name || ""}
                onChange={(e) => {
                  if (selectedBatch) {
                    setExamBatches(prev => prev.map(b => 
                      b.id === selectedBatch.id 
                        ? { ...b, name: e.target.value }
                        : b
                    ))
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Ngày thi</Label>
              <Input
                id="edit-date"
                type="date"
                value={selectedBatch?.examDate || ""}
                onChange={(e) => {
                  if (selectedBatch) {
                    setExamBatches(prev => prev.map(b => 
                      b.id === selectedBatch.id 
                        ? { ...b, examDate: e.target.value }
                        : b
                    ))
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Cập nhật thành công",
                  description: "Đã cập nhật thông tin đợt thi",
                })
                setIsEditModalOpen(false)
              }}>
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={isCandidateModalOpen}
          onClose={() => {
            setIsCandidateModalOpen(false)
            setSelectedCandidate(null)
          }}
          onSendEmail={() => {}}
          onNotesUpdate={() => {}}
          onStatusUpdate={() => {}}
          onStageUpdate={() => {}}
          allCandidates={[]}
          onEmailStatusUpdate={() => {}}
        />
      )}
    </ProtectedRoute>
  )
}
