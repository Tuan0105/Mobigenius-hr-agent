"use client"

import { CandidateDetailModal } from "@/components/candidate-detail-modal"
import { EmailCompositionModal } from "@/components/email-composition-modal"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { POSITION_NAMES } from "@/lib/config-store"
import { useHRData } from "@/lib/data-store"
import type { Candidate } from "@/lib/types"
import { closestCenter, DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Cloud, Download, Loader2, Search, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

const stages = [
  { id: "cv-new", title: "CV Mới" },
  { id: "screening", title: "Đang Sàng Lọc" },
  { id: "knowledge-test", title: "VÒNG THI KIẾN THỨC, KỸ NĂNG" },
  { id: "interview-1", title: "THAM DỰ PHỎNG VẤN VÒNG 1" },
  { id: "interview-2", title: "THAM DỰ PHỎNG VẤN VÒNG 2" },
  { id: "offer", title: "Chờ Quyết Định" },
  { id: "hired", title: "Đã Tuyển" },
  { id: "rejected", title: "Từ chối" },
]

interface SortableCandidateCardProps {
  candidate: Candidate
  onClick: () => void
}

function SortableCandidateCard({ candidate, onClick }: SortableCandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id.toString(),
  })

  // Email status for current stage, read from candidate prop
  const hasEmailForCurrentStage = candidate.emailStatusByStage?.[candidate.stage]?.sent === true

  // Debug log to check if sortable is working
  console.log("SortableCandidateCard rendered for:", `${candidate.hoVaTenDem} ${candidate.ten}`, "isDragging:", isDragging, "listeners:", !!listeners)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "suitable":
        return "bg-success text-success-foreground"
      case "pending":
        return "bg-warning text-warning-foreground"
      case "unsuitable":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "suitable":
        return "Phù hợp"
      case "pending":
        return "Chờ xem xét"
      case "unsuitable":
        return "Không phù hợp"
      default:
        return "Chưa đánh giá"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3 cursor-grab hover:shadow-lg hover:scale-[1.02] transition-all duration-200 relative"
      onClick={(e) => {
        // Prevent click when dragging
        if (isDragging) return
        onClick()
      }}
    >
      <Card className="h-full relative group">
        <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary/20 group-hover:bg-primary transition-colors duration-200 rounded-l-md"></div>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Tên và vị trí */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm text-foreground">{candidate.hoVaTenDem} {candidate.ten}</h4>
                <p className="text-xs text-muted-foreground">{candidate.viTri}</p>
              </div>
              {/* Tag email status ở góc trên phải */}
              {hasEmailForCurrentStage && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600 ml-2">
                  Đã gửi email
                </Badge>
              )}
            </div>
            
            {/* Thông tin cơ bản */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Giới tính:</span>
                <span className="text-foreground">{candidate.gioiTinh}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Năm sinh:</span>
                <span className="text-foreground">{candidate.namSinh}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">SĐT:</span>
                <span className="text-foreground">{candidate.sdt}</span>
              </div>
            </div>

            {/* Học vấn */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Trường:</span>
                <span className="text-foreground truncate ml-2">{candidate.truongDaoTao}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Chuyên ngành:</span>
                <span className="text-foreground truncate ml-2">{candidate.chuyenNganh}</span>
              </div>
            </div>

            {/* Kinh nghiệm */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Kinh nghiệm:</span>
              <span className="text-xs font-medium text-foreground">{candidate.kinhNghiemLamViec} năm</span>
            </div>

            {/* Điểm và trạng thái */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-medium">Điểm: {candidate.score}/100</span>
              <Badge className={`text-xs ${getStatusColor(candidate.status)}`}>{getStatusText(candidate.status)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Droppable Stage Component
function DroppableStage({ 
  stage, 
  children, 
  candidates 
}: { 
  stage: { id: string; title: string; count: number }
  children: React.ReactNode
  candidates: Candidate[]
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.id,
  })

  // Debug log to check if droppable is working
  console.log("DroppableStage rendered for:", stage.title, "isOver:", isOver)

  return (
    <div id={`stage-${stage.id}`} className="flex flex-col w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{stage.title}</h3>
        <Badge 
          variant="secondary" 
          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {stage.count}
        </Badge>
      </div>

      <div 
        ref={setNodeRef}
        className={`bg-muted/30 rounded-lg p-3 min-h-96 border-2 border-dashed transition-colors ${
          isOver 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/20 hover:border-muted-foreground/40'
        }`}
        data-stage={stage.id}
      >
        {candidates.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {isOver ? 'Thả vào đây...' : 'Không có ứng viên'}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function CandidateCard({ candidate, onClick }: { candidate: Candidate; onClick: () => void }) {
  // Email status for current stage, read from candidate prop
  const hasEmailForCurrentStage = candidate.emailStatusByStage?.[candidate.stage]?.sent === true

  const getStatusColor = (status: string) => {
    switch (status) {
      case "suitable":
        return "bg-success text-success-foreground"
      case "pending":
        return "bg-warning text-warning-foreground"
      case "unsuitable":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "suitable":
        return "Phù hợp"
      case "pending":
        return "Chờ xem xét"
      case "unsuitable":
        return "Không phù hợp"
      default:
        return "Chưa đánh giá"
    }
  }

  return (
    <div className="mb-3 cursor-pointer hover:shadow-lg transition-all duration-200 opacity-90 relative" onClick={onClick}>
      <Card className="h-full relative group">
        <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary/40 group-hover:bg-primary transition-colors duration-200 rounded-l-md"></div>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Tên và vị trí */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm text-foreground">{candidate.hoVaTenDem} {candidate.ten}</h4>
                <p className="text-xs text-muted-foreground">{candidate.viTri}</p>
              </div>
              {/* Tag email status ở góc trên phải */}
              {hasEmailForCurrentStage && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600 ml-2">
                  Đã gửi email
                </Badge>
              )}
            </div>
            
            {/* Thông tin cơ bản */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Giới tính:</span>
                <span className="text-foreground">{candidate.gioiTinh}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Năm sinh:</span>
                <span className="text-foreground">{candidate.namSinh}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">SĐT:</span>
                <span className="text-foreground">{candidate.sdt}</span>
              </div>
            </div>

            {/* Học vấn */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Trường:</span>
                <span className="text-foreground truncate ml-2">{candidate.truongDaoTao}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Chuyên ngành:</span>
                <span className="text-foreground truncate ml-2">{candidate.chuyenNganh}</span>
              </div>
            </div>

            {/* Kinh nghiệm */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Kinh nghiệm:</span>
              <span className="text-xs font-medium text-foreground">{candidate.kinhNghiemLamViec} năm</span>
            </div>

            {/* Điểm và trạng thái */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-medium">Điểm: {candidate.score}/100</span>
              <Badge className={`text-xs ${getStatusColor(candidate.status)}`}>{getStatusText(candidate.status)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HRAgentPage() {
  const router = useRouter()
  const {
    candidates,
    allCandidates,
    filters,
    setFilters,
    isLoading,
    updateCandidateStage,
    updateCandidateNotes,
    updateCandidateStatus,
    updateCandidateEmailStatus,
    getEmailStatusForStage,
    addEmailActivity,
    syncCVsFromEmail,
    getStageStats,
  } = useHRData()

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailCandidate, setEmailCandidate] = useState<Candidate | null>(null)
  const [emailType, setEmailType] = useState<"interview" | "offer" | "reject">("interview")
  const [activeId, setActiveId] = useState<string | null>(null)

  // Function to download all candidates as Excel
  const handleDownloadAll = () => {
    const headers = [
      "STT", "Nguồn hồ sơ", "Vị trí", "Họ tên đệm", "Tên", "Giới tính", "Năm sinh",
      "SĐT", "Email", "Trường đào tạo", "Hệ đào tạo", "Chuyên ngành", "Loại tốt nghiệp",
      "Năm tốt nghiệp", "Thạc sỹ", "Khu vực", "Đơn vị ứng tuyển", "Hình thức",
      "Kinh nghiệm", "Đơn vị sàng lọc", "Điểm", "Trạng thái", "Giai đoạn", "Ghi chú"
    ]

    const csvContent = [
      headers.join(","),
      ...candidates.map(c => [
        c.stt,
        c.nguonHoSo,
        c.viTri,
        c.hoVaTenDem,
        c.ten,
        c.gioiTinh,
        c.namSinh,
        c.sdt,
        c.email,
        c.truongDaoTao,
        c.heDaoTao,
        c.chuyenNganh,
        c.loaiTotNghiep,
        c.namTotNghiep,
        c.thacSy,
        c.khuVuc,
        c.donViUngTuyen,
        c.hinhThuc,
        c.kinhNghiemLamViec,
        c.donViSangLocHS,
        c.score,
        c.status,
        c.stage,
        c.notes || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tat_ca_ung_vien_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0, // No distance constraint for immediate activation
      },
    })
  )

  // Debug log to check sensors
  console.log("Sensors configured:", sensors)

  // Get stage statistics
  const stageStats = getStageStats()
  const stagesWithCounts = stages.map((stage) => ({
    ...stage,
    count: stageStats[stage.id as keyof typeof stageStats] || 0,
  }))

  const handleCandidateClick = (candidate: Candidate) => {
    console.log("Candidate clicked:", candidate) // Debug log
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  const handleSendEmail = (type: "interview" | "offer" | "reject") => {
    if (selectedCandidate) {
      addEmailActivity(selectedCandidate.id, type)
      updateCandidateEmailStatus(selectedCandidate.id, true, undefined, selectedCandidate.stage)
      toast({
        title: "Email đã được gửi",
        description: `Đã gửi email ${type === "interview" ? "mời phỏng vấn" : type === "offer" ? "chào mừng" : "từ chối"} cho ${selectedCandidate.hoVaTenDem} ${selectedCandidate.ten}`,
      })
    }
  }

  const handleNotesUpdate = (candidateId: number, notes: string) => {
    updateCandidateNotes(candidateId, notes)
  }

  const handleStatusUpdate = (candidateId: number, status: Candidate["status"]) => {
    // Update candidate status
    updateCandidateStatus(candidateId, status)
    
    // Show toast notification
    const candidate = candidates.find(c => c.id === candidateId)
    if (candidate) {
      const statusText = status === "suitable" ? "Phù hợp" : status === "unsuitable" ? "Không phù hợp" : "Chờ xem xét"
      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Đã đánh giá ${candidate.hoVaTenDem} ${candidate.ten} là ${statusText}`,
      })

      // If marked as unsuitable, move to rejected and open reject email modal
      if (status === "unsuitable") {
        updateCandidateStage(candidateId, "rejected" as any)
        setEmailCandidate(candidate)
        setEmailType("reject")
        setEmailModalOpen(true)
      }
    }
  }

  const handleStageUpdate = (candidateId: number, stage: string) => {
    // Update candidate stage
    updateCandidateStage(candidateId, stage as any)
    
    // Show toast notification
    const candidate = candidates.find(c => c.id === candidateId)
    if (candidate) {
      const stageText = stage === "rejected" ? "Từ chối" : stage
      toast({
        title: "Chuyển giai đoạn thành công",
        description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${stageText}`,
      })
    }
  }

  const scrollToStage = (stageId: string) => {
    if (typeof document === 'undefined') return
    const el = document.getElementById(`stage-${stageId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag started:", event.active.id) // Debug log
    console.log("Active element:", event.active.data.current) // Debug log
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      console.log("Drag ended:", { active: active.id, over: over?.id }) // Debug log
      console.log("Over element:", over?.data.current) // Debug log
      setActiveId(null)

      if (!over) {
        console.log("No drop target") // Debug log
        return
      }

      const candidateId = Number.parseInt(active.id as string)

      // Determine target stage id.
      let targetStage: Candidate["stage"] | undefined
      // Case 1: Dropped on a column droppable
      if (stages.some((s) => s.id === over.id)) {
        targetStage = over.id as Candidate["stage"]
      } else {
        // Case 2: Dropped on top of another card → read its containerId
        const containerId = (over.data.current as any)?.sortable?.containerId
        if (containerId && stages.some((s) => s.id === containerId)) {
          targetStage = containerId as Candidate["stage"]
        }
      }

      if (!targetStage) {
        console.log("Cannot determine target stage from over:", over)
        return
      }
      
      console.log("Candidate ID:", candidateId, "New Stage:", targetStage) // Debug log

      // Find the candidate being moved
      const candidate = candidates.find((c) => c.id === candidateId)
      if (!candidate) {
        console.log("Candidate not found:", candidateId) // Debug log
        return
      }

      console.log("Found candidate:", `${candidate.hoVaTenDem} ${candidate.ten}`, "Current stage:", candidate.stage) // Debug log

      // Check if dropping in the same stage
      if (candidate.stage === targetStage) {
        console.log("Dropped in same stage, no action needed") // Debug log
        return
      }

      const oldStage = candidate.stage
      const newStageTitle = stagesWithCounts.find((s) => s.id === targetStage)?.title

      console.log("Updating candidate stage from", oldStage, "to", targetStage) // Debug log

      // Block moving pending status to non-allowed stages
      const isPending = candidate.status === 'pending'
      const allowedStagesForPending: Candidate["stage"][] = ["cv-new", "screening"]
      if (isPending && !allowedStagesForPending.includes(targetStage)) {
        toast({
          title: "Không thể chuyển giai đoạn",
          description: "CV 'Chờ xem xét' chỉ có thể ở 'CV Mới' hoặc 'Đang Sàng Lọc'",
        })
        return
      }

      // Block moving from rejected to any stage except screening
      if (oldStage === "rejected" && targetStage !== "screening") {
        toast({
          title: "Không thể chuyển giai đoạn",
          description: "Ứng viên bị từ chối chỉ có thể chuyển về 'Đang Sàng Lọc'",
        })
        return
      }

      // Block skipping interview rounds - must go through interview-1 before interview-2
      if (oldStage === "knowledge-test" && targetStage === "interview-2") {
        toast({
          title: "Không thể bỏ qua vòng phỏng vấn",
          description: "Ứng viên phải tham gia phỏng vấn vòng 1 trước khi chuyển sang vòng 2",
        })
        return
      }

      // If moving from rejected back to screening, reset status to pending so actions reappear
      if (oldStage === "rejected" && targetStage === "screening" && candidate.status !== "pending") {
        updateCandidateStatus(candidateId, "pending")
      }

      // Update candidate stage (valid)
      updateCandidateStage(candidateId, targetStage)
      
      // Update email status based on the new stage
      // Check if email was already sent for this stage
      const emailStatusForNewStage = getEmailStatusForStage(candidateId, targetStage)
      updateCandidateEmailStatus(candidateId, emailStatusForNewStage.sent, emailStatusForNewStage.lastSent, targetStage)
      console.log("Updated email status for new stage:", emailStatusForNewStage) // Debug log
      
      console.log("Candidate stage updated successfully") // Debug log

      // Action Triggers based on drag direction
      console.log("Checking action triggers:", { oldStage, newStage: targetStage }) // Debug log
      
      if (oldStage === "screening" && targetStage === "knowledge-test") {
        // VD1: Kéo từ "Đang Sàng Lọc" -> "VÒNG THI KIẾN THỨC, KỸ NĂNG"
        console.log("Triggering knowledge test email modal") // Debug log
        setEmailCandidate(candidate)
        setEmailType("interview")
        setEmailModalOpen(true)
        toast({
          title: "Mở email mời thi kiến thức",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Mở popup gửi email mời thi kiến thức.`,
        })
      } else if (oldStage === "knowledge-test" && targetStage === "interview-1") {
        // VD2: Kéo từ "VÒNG THI KIẾN THỨC" -> "PHỎNG VẤN VÒNG 1"
        console.log("Triggering interview 1 email modal") // Debug log
        setEmailCandidate(candidate)
        setEmailType("interview")
        setEmailModalOpen(true)
        toast({
          title: "Mở email mời phỏng vấn vòng 1",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Mở popup gửi email mời phỏng vấn vòng 1.`,
        })
      } else if (oldStage === "interview-1" && targetStage === "interview-2") {
        // VD3: Kéo từ "PHỎNG VẤN VÒNG 1" -> "PHỎNG VẤN VÒNG 2"
        console.log("Triggering interview 2 email modal") // Debug log
        setEmailCandidate(candidate)
        setEmailType("interview")
        setEmailModalOpen(true)
        toast({
          title: "Mở email mời phỏng vấn vòng 2",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Mở popup gửi email mời phỏng vấn vòng 2.`,
        })
      } else if (targetStage === "rejected") {
        // VD4: Kéo từ bất kỳ cột nào -> "Từ chối"
        console.log("Triggering reject email modal") // Debug log
        setEmailCandidate(candidate)
        setEmailType("reject")
        setEmailModalOpen(true)
        toast({
          title: "Mở email từ chối",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Mở popup gửi email từ chối.`,
        })
      } else if (oldStage === "cv-new" && targetStage === "screening") {
        // VD5: Kéo từ "CV Mới" -> "Đang Sàng Lọc"
        console.log("Triggering AI screening") // Debug log
        // Khi vào sàng lọc, luôn đặt trạng thái về 'pending' để HR có thể đánh giá
        updateCandidateStatus(candidateId, "pending")
        toast({
          title: "Kích hoạt AI sàng lọc",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Kích hoạt AI chạy sàng lọc tự động.`,
        })
        // Có thể thêm logic gọi AI sàng lọc ở đây
      } else if (oldStage === "offer" && targetStage === "hired") {
        // VD6: Kéo từ "Chờ Quyết Định" -> "Đã Tuyển"
        console.log("Triggering offer email modal") // Debug log
        setEmailCandidate(candidate)
        setEmailType("offer")
        setEmailModalOpen(true)
        toast({
          title: "Mở email thư mời làm việc",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Mở popup gửi email thư mời làm việc.`,
        })
      } else if (oldStage === "interview-1" && targetStage === "hired") {
        // VD7: Kéo từ "Tham dự phỏng vấn vòng 1" -> "Đã Tuyển"
        console.log("Triggering offer email modal from interview-1") // Debug log
        setEmailCandidate(candidate)
        setEmailType("offer")
        setEmailModalOpen(true)
        toast({
          title: "Mở email thư mời làm việc",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Mở popup gửi email thư mời làm việc.`,
        })
      } else if (oldStage === "interview-2" && targetStage === "hired") {
        // VD8: Kéo từ "Tham dự phỏng vấn vòng 2" -> "Đã Tuyển"
        console.log("Triggering offer email modal from interview-2") // Debug log
        setEmailCandidate(candidate)
        setEmailType("offer")
        setEmailModalOpen(true)
        toast({
          title: "Mở email thư mời làm việc",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Mở popup gửi email thư mời làm việc.`,
        })
      } else {
        // Các trường hợp khác
        console.log("Triggering general success toast") // Debug log
        toast({
          title: "Cập nhật thành công",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang giai đoạn ${newStageTitle}`,
        })
      }
    },
    [candidates, updateCandidateStage, stagesWithCounts],
  )

  const handleEmailSend = (emailData: any) => {
    if (emailCandidate) {
      // Record activity with the current email type
      addEmailActivity(emailCandidate.id, emailType, {
        subject: emailData.subject,
        interviewDate: emailData.interviewDate,
        interviewTime: emailData.interviewTime,
        sentAt: new Date().toISOString(),
      })

      // Mark email as sent for the candidate's current stage (already updated before opening modal)
      updateCandidateEmailStatus(emailCandidate.id, true, undefined, emailCandidate.stage)

      // Toast by type
      const message =
        emailType === "interview"
          ? "Email mời phỏng vấn đã được gửi"
          : emailType === "offer"
          ? "Email mời làm việc đã được gửi"
          : "Email từ chối đã được gửi"

      toast({
        title: message,
        description: `Đã gửi email ${emailType === "interview" ? "mời phỏng vấn" : emailType === "offer" ? "mời làm việc" : "từ chối"} cho ${emailCandidate.hoVaTenDem} ${emailCandidate.ten}`,
      })
    }
  }

  const handleSyncCVs = async () => {
    try {
      // Hiển thị thông báo đang đồng bộ
      toast({
        title: "Đang đồng bộ CV từ email",
        description: "Vui lòng chờ trong giây lát...",
      })
      
      const result = await syncCVsFromEmail()
      
      // Kiểm tra kết quả đồng bộ
      if (result && result.newCVs > 0) {
        toast({
          title: "Đồng bộ thành công",
          description: `Đã đồng bộ thành công ${result.newCVs} CV mới!`,
        })
      } else {
        toast({
          title: "Không có CV mới",
          description: "Không tìm thấy CV mới nào trong email.",
        })
      }
    } catch (error) {
      toast({
        title: "Đồng bộ thất bại",
        description: "Đồng bộ thất bại, vui lòng thử lại!",
        variant: "destructive",
      })
    }
  }

  const activeDragCandidate = activeId ? candidates.find((c: Candidate) => c.id.toString() === activeId) : null

  // Debug log to check if component is rendering
  console.log("HRAgentPage rendering with candidates:", candidates.length)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">HR Agent - Quản lý Tuyển dụng</h1>
                <p className="text-sm text-muted-foreground mt-1">Quản lý và theo dõi quy trình tuyển dụng thông minh</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2 bg-transparent hover:bg-accent" 
                  onClick={handleSyncCVs} 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                  Đồng bộ CV từ Email
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 bg-transparent hover:bg-accent"
                  onClick={handleDownloadAll}
                >
                  <Download className="h-4 w-4" />
                  Tải tất cả
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => router.push("/config")}
                  className="hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Filter Bar */}
          <div className="border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-4">
              <Select value={filters.position} onValueChange={(value) => setFilters({ ...filters, position: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Vị trí tuyển dụng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Array.from(POSITION_NAMES).map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.stage} onValueChange={(value) => setFilters({ ...filters, stage: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="cv-new">CV Mới</SelectItem>
                  <SelectItem value="screening">Đang Sàng Lọc</SelectItem>
                  <SelectItem value="knowledge-test">Vòng Thi Kiến Thức, Kỹ Năng</SelectItem>
                  <SelectItem value="interview-1">Tham Dự Phỏng Vấn Vòng 1</SelectItem>
                  <SelectItem value="interview-2">Tham Dự Phỏng Vấn Vòng 2</SelectItem>
                  <SelectItem value="offer">Chờ Quyết Định</SelectItem>
                  <SelectItem value="hired">Đã Tuyển</SelectItem>
                  <SelectItem value="rejected">Từ Chối</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Kết quả sàng lọc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="suitable">Phù hợp</SelectItem>
                  <SelectItem value="pending">Chờ xem xét</SelectItem>
                  <SelectItem value="unsuitable">Không phù hợp</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm ứng viên theo tên, email, kỹ năng..."
                  value={filters.search}
                  onChange={(e) => {
                    // Real-time search với debounce
                    setFilters({ ...filters, search: e.target.value })
                  }}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter} 
              onDragStart={(event) => {
                console.log("DndContext onDragStart triggered", event) // Debug log
                handleDragStart(event)
              }}
              onDragEnd={(event) => {
                console.log("DndContext onDragEnd triggered", event) // Debug log
                handleDragEnd(event)
              }}
            >
              <div className="flex gap-6 min-w-max">
                {stagesWithCounts.map((stage) => {
                  const stageCandidates = candidates
                    .filter((candidate: Candidate) => candidate.stage === stage.id)
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

                  return (
                    <DroppableStage key={stage.id} stage={stage} candidates={stageCandidates}>
                      <SortableContext
                        id={stage.id}
                        items={stageCandidates.map((c) => c.id.toString())}
                        strategy={verticalListSortingStrategy}
                      >
                        {stageCandidates.map((candidate: Candidate) => (
                          <SortableCandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onClick={() => handleCandidateClick(candidate)}
                          />
                        ))}
                      </SortableContext>
                    </DroppableStage>
                  )
                })}
              </div>

              <DragOverlay>
                {activeDragCandidate ? (
                  <div className="opacity-90 transform rotate-2">
                    <CandidateCard candidate={activeDragCandidate} onClick={() => {}} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </main>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={isModalOpen}
          onClose={() => {
            console.log("Closing modal") // Debug log
            setIsModalOpen(false)
            setSelectedCandidate(null)
          }}
          onSendEmail={handleSendEmail}
          onNotesUpdate={handleNotesUpdate}
          onStatusUpdate={handleStatusUpdate}
          onStageUpdate={handleStageUpdate}
          allCandidates={candidates}
        />
      )}

      {/* Auto-triggered Email Modal for Interview Invitations */}
      {emailCandidate && (
        <EmailCompositionModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          onSend={handleEmailSend}
          candidate={{
            id: emailCandidate.id, // Added missing id field
            name: `${emailCandidate.hoVaTenDem} ${emailCandidate.ten}`,
            email: emailCandidate.email,
            position: emailCandidate.viTri,
          }}
          emailType={emailType}
        />
      )}
    </div>
  )
}
