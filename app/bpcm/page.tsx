"use client"

import { CandidateDetailModal } from "@/components/candidate-detail-modal"
import { ProtectedRoute } from "@/components/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useHRData } from "@/lib/data-store"
import type { Candidate } from "@/lib/types"
import { Check, Eye, LogOut, Search, X } from "lucide-react"
import { useState } from "react"

export default function BPCMPage() {
  const { candidates, updateCandidateStage } = useHRData()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")

  // Filter candidates that are pending BPCM review with search and position filter
  const pendingCandidates = candidates.filter(candidate => {
    if (candidate.stage !== "bpcm-pending") return false
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const fullName = `${candidate.hoVaTenDem} ${candidate.ten}`.toLowerCase()
      if (!fullName.includes(searchLower)) return false
    }
    
    // Position filter
    if (positionFilter !== "all" && candidate.viTri !== positionFilter) return false
    
    return true
  })

  // Get unique positions for filter
  const uniquePositions = Array.from(new Set(
    candidates
      .filter(c => c.stage === "bpcm-pending")
      .map(c => c.viTri)
  ))

  const handleViewDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowDetailModal(true)
  }

  const handleAction = (candidate: Candidate, type: 'approve' | 'reject') => {
    setSelectedCandidate(candidate)
    setActionType(type)
    setShowActionDialog(true)
  }

  const handleSubmitAction = () => {
    console.log('handleSubmitAction called', { selectedCandidate, actionType, reason })
    
    if (!selectedCandidate || !actionType) {
      console.log('Missing required data', { selectedCandidate, actionType })
      return
    }

    const newStage = actionType === 'approve' ? 'knowledge-test' : 'bpcm-rejected'
    const rejectionReason = actionType === 'reject' ? reason : ''
    
    console.log('Updating candidate', { candidateId: selectedCandidate.id, newStage, rejectionReason })

    // Update candidate stage
    updateCandidateStage(selectedCandidate.id, newStage)
    
    // Note: Activity will be added automatically by the system
    // The stage change itself indicates the BPCM action

    // Show success message
    toast({
      title: actionType === 'approve' ? 'Đã đồng ý ứng viên' : 'Đã từ chối ứng viên',
      description: actionType === 'approve' 
        ? 'Ứng viên đã được chuyển sang giai đoạn tiếp theo'
        : 'Ứng viên đã bị từ chối',
    })

    // Close dialogs
    setShowActionDialog(false)
    setShowDetailModal(false)
    setSelectedCandidate(null)
    setActionType(null)
    setReason("")
  }

  const handleLogout = () => {
    // This will be handled by the auth context
    window.location.href = '/login'
  }

  return (
    <ProtectedRoute allowedRoles={['bpcm']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">BPCM - Phòng Big Data</h1>
              <p className="text-muted-foreground">Bộ phận chuyên môn - Phòng Big Data</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Filter Bar */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search" className="text-sm font-medium text-muted-foreground">Tìm kiếm ứng viên</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Nhập tên ứng viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="w-48">
                    <Label htmlFor="position" className="text-sm font-medium text-muted-foreground">Vị trí ứng tuyển</Label>
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn vị trí" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vị trí</SelectItem>
                        {uniquePositions.map(position => (
                          <SelectItem key={position} value={position}>{position}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Danh sách hồ sơ chờ duyệt</span>
                <Badge variant="secondary">{pendingCandidates.length} hồ sơ</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Không có hồ sơ nào đang chờ duyệt</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên ứng viên</TableHead>
                      <TableHead>Vị trí ứng tuyển</TableHead>
                      <TableHead>Kinh nghiệm</TableHead>
                      <TableHead>Kỹ năng chính</TableHead>
                      <TableHead>Điểm AI</TableHead>
                      <TableHead>Ngày HR gửi</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => handleViewDetail(candidate)}
                            className="text-left hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                          >
                            {candidate.hoVaTenDem} {candidate.ten}
                          </button>
                        </TableCell>
                        <TableCell>{candidate.viTri}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {candidate.kinhNghiemLamViec} năm
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidate.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={candidate.score >= 80 ? "default" : candidate.score >= 60 ? "secondary" : "destructive"}>
                              {candidate.score}/100
                            </Badge>
                            <Badge variant={candidate.status === "suitable" ? "default" : "destructive"} className="text-xs">
                              {candidate.status === "suitable" ? "Phù hợp" : "Không phù hợp"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(candidate.updatedAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(candidate)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Xem chi tiết
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAction(candidate, 'approve')}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                              Đồng ý
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleAction(candidate, 'reject')}
                              className="gap-1"
                            >
                              <X className="h-4 w-4" />
                              Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <CandidateDetailModal
            candidate={selectedCandidate}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedCandidate(null)
            }}
            onEmailAction={() => {}}
          />
        )}

        {/* Action Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Đồng ý ứng viên' : 'Từ chối ứng viên'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' 
                  ? 'Bạn có chắc chắn muốn đồng ý ứng viên này không?'
                  : 'Bạn có chắc chắn muốn từ chối ứng viên này không?'
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedCandidate && (
              <div className="py-4">
                <p className="font-medium">
                  Ứng viên: {selectedCandidate.hoVaTenDem} {selectedCandidate.ten}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vị trí: {selectedCandidate.viTri}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">
                  {actionType === 'approve' ? 'Lý do đồng ý (tùy chọn)' : 'Lý do từ chối (tùy chọn)'}
                </Label>
                <Textarea
                  id="reason"
                  placeholder={actionType === 'approve' 
                    ? 'Nhập lý do đồng ý...'
                    : 'Nhập lý do từ chối...'
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionDialog(false)
                  setActionType(null)
                  setReason("")
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitAction}
                className={actionType === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
                }
              >
                {actionType === 'approve' ? 'Đồng ý' : 'Từ chối'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
