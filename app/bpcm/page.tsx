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
  const { candidates, updateCandidateBPCMReviews, addActivity } = useHRData()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState("")

  // Local decisions: keep CVs in list but show what we chose
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'rejected'>>({})

  // Filter candidates that are pending BPCM review with search and position filter
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const pendingCandidates = candidates.filter(candidate => {
    if (candidate.stage !== "bpcm-pending") return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const fullName = `${candidate.hoVaTenDem} ${candidate.ten}`.toLowerCase()
      if (!fullName.includes(searchLower)) return false
    }
    if (positionFilter !== "all" && candidate.viTri !== positionFilter) return false
    return true
  })

  const uniquePositions = Array.from(new Set(
    candidates
      .filter(c => c.stage === "bpcm-pending")
      .map(c => c.viTri)
  ))

  const handleViewDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowDetailModal(true)
  }

  const openActionDialog = (candidate: Candidate, type: 'approve' | 'reject') => {
    setSelectedCandidate(candidate)
    setActionType(type)
    setShowActionDialog(true)
  }

  const handleSubmitAction = () => {
    if (!selectedCandidate || !actionType) return

    // Record decision locally and keep in the list
    setDecisions(prev => ({ ...prev, [selectedCandidate.id]: actionType === 'approve' ? 'approved' : 'rejected' }))

    // Sync decision to HR data (update bpcmReviews, keep stage as bpcm-pending)
    const review = {
      id: `${selectedCandidate.id}-bpcm-local-${Date.now()}`,
      departmentId: "bigdata",
      departmentName: "P. Big Data",
      status: actionType === 'approve' ? 'approved' : 'rejected' as const,
      submittedAt: selectedCandidate.updatedAt,
      reviewedAt: new Date().toISOString(),
      reviewer: "BPCM Big Data",
      reason: reason || (actionType === 'approve' ? 'Đồng ý sau khi xem xét hồ sơ' : 'Không phù hợp với yêu cầu chuyên môn'),
    }
    updateCandidateBPCMReviews(selectedCandidate.id, [review], 'bpcm-pending')

    // Log activity for HR
    addActivity(
      selectedCandidate.id,
      actionType === 'approve' ? 'BPCM đồng ý ứng viên' : 'BPCM từ chối ứng viên',
      'BPCM Big Data',
      { department: 'P. Big Data', reason }
    )

    toast({
      title: actionType === 'approve' ? 'Đã đồng ý ứng viên' : 'Đã từ chối ứng viên',
      description: `${selectedCandidate.hoVaTenDem} ${selectedCandidate.ten} • ${actionType === 'approve' ? 'Đồng ý' : 'Từ chối'}`,
    })

    setShowActionDialog(false)
    setActionType(null)
    setReason("")
  }

  const handleLogout = () => {
    window.location.href = "/login"
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
                      <TableHead>Kết quả của tôi</TableHead>
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
                          </div>
                        </TableCell>
                        <TableCell>
                          {decisions[candidate.id] ? (
                            decisions[candidate.id] === 'approved' ? (
                              <Badge variant="default" className="bg-green-600 text-white border-green-600">Đã đồng ý</Badge>
                            ) : (
                              <Badge variant="destructive">Đã từ chối</Badge>
                            )
                          ) : (
                            <Badge variant="secondary">Chưa chọn</Badge>
                          )}
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
                              onClick={() => openActionDialog(candidate, 'approve')}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              disabled={!!decisions[candidate.id]}
                            >
                              <Check className="h-4 w-4" />
                              Đồng ý
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openActionDialog(candidate, 'reject')}
                              className="gap-1"
                              disabled={!!decisions[candidate.id]}
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
            onSendEmail={() => {}}
            onOpenBPCMSelector={() => {}}
            allCandidates={candidates}
            onNotesUpdate={() => {}}
            onStageUpdate={() => {}}
            onBPCMApprove={!decisions[selectedCandidate.id] ? () => openActionDialog(selectedCandidate!, 'approve') : undefined}
            onBPCMReject={!decisions[selectedCandidate.id] ? () => openActionDialog(selectedCandidate!, 'reject') : undefined}
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
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>Hủy</Button>
              <Button onClick={handleSubmitAction} className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                {actionType === 'approve' ? 'Đồng ý' : 'Từ chối'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
