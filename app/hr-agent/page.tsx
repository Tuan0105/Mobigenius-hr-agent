"use client"

import { CandidateDetailModal } from "@/components/candidate-detail-modal"
import { EmailCompositionModal } from "@/components/email-composition-modal"
import { ExamBatchAssignmentModal } from "@/components/exam-batch-assignment-modal"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableBody, TableCell, Table as TableComponent, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { POSITION_NAMES, useConfigData } from "@/lib/config-store"
import { useHRData } from "@/lib/data-store"
import type { BPCMReview, Candidate } from "@/lib/types"
import { closestCenter, DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bell, Check, Cloud, Download, Eye, FileText, Loader2, Mail, MoreHorizontal, Search, Users, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const stages = [
  { id: "cv-new", title: "CV Mới" },
  { id: "knowledge-test", title: "Vòng Thi Kiến Thức, Kỹ Năng" },
  { id: "waiting-exam-schedule", title: "Chờ xếp lịch thi" },
  { id: "scheduled-exam", title: "Đã xếp lịch thi" },
  { id: "pass-test", title: "Đạt thi" },
  { id: "fail-test", title: "Không đạt thi" },
  { id: "interview-1", title: "Tham dự phỏng vấn vòng 1" },
  { id: "interview-2", title: "Tham dự phỏng vấn vòng 2" },
  { id: "offer", title: "Nhân sự chính thức" },
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
      case "suitable-form1":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "suitable-form2":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "unsuitable":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "suitable-form1":
        return "Phù hợp (H1)"
      case "suitable-form2":
        return "Phù hợp (H2)"
      case "unsuitable":
        return "Không phù hợp"
      default:
        return "Chưa đánh giá"
    }
  }

  // Stage badge styles for table view (available in HRAgentPage scope)
  const getStageBadgeClassTable = (stage: string) => {
    switch (stage) {
      case "cv-new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "screening":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "knowledge-test":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "interview-1":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
      case "interview-2":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
      case "offer":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      case "hired":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-muted text-foreground"
    }
  }

  // Stage badge styles for table view
  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case "cv-new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "screening":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "bpcm-pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "bpcm-rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "knowledge-test":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "interview-1":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
      case "interview-2":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
      case "offer":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      case "hired":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-muted text-foreground"
    }
  }

  // duplicate removed

  

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
                  {candidate.stage === "offer" ? "Đã gửi hướng dẫn KSK" : "Đã gửi email"}
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
      case "suitable-form1":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "suitable-form2":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "unsuitable":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "suitable-form1":
        return "Phù hợp (H1)"
      case "suitable-form2":
        return "Phù hợp (H2)"
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
                  {candidate.stage === "offer" ? "Đã gửi hướng dẫn KSK" : "Đã gửi email"}
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
  // AI result is derived from score with 3 categories
  const getAIStatusFromScore = (score: number): "suitable" | "unsuitable" | "suitable-form1" | "suitable-form2" => {
    if (score < 30) return "unsuitable"
    if (score >= 30 && score < 70) return "suitable-form2" // Hình thức 2 - Cần thi kỹ năng
    return "suitable-form1" // Hình thức 1 - Tới phỏng vấn ngay
  }
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getTemplateByType } = useConfigData()
  const {
    candidates,
    allCandidates,
    filters,
    setFilters,
    isLoading,
    updateCandidateStage,
    updateCandidateInterviewResult,
    updateCandidateSchedule,
    updateCandidateExamBatch,
    updateCandidateNotes,
    updateCandidateStatus,
    updateCandidateEmailStatus,
    updateCandidateBPCMReviews,
    getEmailStatusForStage,
    addEmailActivity,
    syncCVsFromEmail,
    getStageStats,
    examBatches,
  } = useHRData()

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailCandidate, setEmailCandidate] = useState<Candidate | null>(null)
  const [emailType, setEmailType] = useState<"interview" | "offer" | "reject">("interview")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [emailMenuOpenId, setEmailMenuOpenId] = useState<number | null>(null)
  
  
  // Notification popover state
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false)
  
  // Exam batch assignment states
  const [examBatchAssignmentOpen, setExamBatchAssignmentOpen] = useState(false)
  
  // Status change modal states
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  
  // Function to handle email menu click with auto-scroll
  const handleEmailMenuClick = useCallback((candidateId: number) => {
    setEmailMenuOpenId(emailMenuOpenId === candidateId ? null : candidateId)
    
    // Auto-scroll to ensure menu is visible
    setTimeout(() => {
      const menuElement = document.getElementById(`email-inline-menu-${candidateId}`)
      if (menuElement) {
        menuElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        })
      }
    }, 100)
  }, [emailMenuOpenId])
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false)
  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false)
  const [bulkEmailComposeOpen, setBulkEmailComposeOpen] = useState(false)
  const [bulkEmailTemplate, setBulkEmailTemplate] = useState<string>("")
  const [bulkEmailSubject, setBulkEmailSubject] = useState<string>("")
  const [bulkEmailContent, setBulkEmailContent] = useState<string>("")
  // Track which stage the email is intended for (when stage changes right before opening modal)
  const [emailStageOverride, setEmailStageOverride] = useState<string | null>(null)

  // Open candidate detail by query param (?candidateId=123)
  useEffect(() => {
    const cid = searchParams?.get("candidateId")
    if (cid) {
      const c = candidates.find(x => x.id === Number(cid))
      if (c) {
        setSelectedCandidate(c)
        setIsModalOpen(true)
      }
    }
  }, [searchParams, candidates])
  
  // Map template type to human-readable action label for toasts and menus
  const templateTypeToLabel = useCallback((templateType: string): string => {
    switch (templateType) {
      case "interview-knowledge-test":
        return "mời thi kỹ năng"
      case "interview-round-1":
        return "mời phỏng vấn vòng 1"
      case "interview-round-2":
        return "mời phỏng vấn vòng 2"
      case "offer-congratulations":
        return "thư mời làm việc"
      case "offer-health-check":
        return "hướng dẫn khám sức khỏe"
      case "reject":
        return "từ chối"
      default:
        return "email"
    }
  }, [])
  
  // Helper function to get correct template type based on stage
  const getTemplateTypeFromStage = (stage: string, emailType: "interview" | "offer" | "reject") => {
    if (emailType === "reject") return "reject"
    if (emailType === "offer") {
      // For offer emails, determine based on stage
      switch (stage) {
        case "offer":
          return "offer-health-check" // Health check email for offer stage
        case "hired":
          return "offer-congratulations" // Congratulations email for hired stage
        default:
          return "offer-congratulations" // Default fallback
      }
    }
    
    // For interview emails, determine based on stage
    switch (stage) {
      case "knowledge-test":
        return "interview-knowledge-test"
      case "interview-1":
        return "interview-round-1"
      case "interview-2":
        return "interview-round-2"
      case "cv-new":
        return "interview-knowledge-test" // When moving from CV to knowledge test
      default:
        return "interview-round-1" // Default fallback
    }
  }
  
  // View mode state (default to table)
  const [viewMode, setViewMode] = useState<"kanban" | "table">("table")
  
  // Table view states
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<keyof Candidate>("updatedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  // Date range filter (schedule date if exists, otherwise application date)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

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
      const statusText = status === "suitable" ? "Phù hợp" : "Không phù hợp"
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

      const candidateId = parseInt(active.id as string, 10)

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

      // Remove pending status constraints since we no longer use pending status

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

      // If moving from rejected back to screening, reset status to default
      if (oldStage === "rejected" && targetStage === "screening") {
        updateCandidateStatus(candidateId, "suitable")
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
        // Khi vào sàng lọc, giữ nguyên trạng thái hiện tại
        toast({
          title: "Kích hoạt AI sàng lọc",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. Kích hoạt AI chạy sàng lọc tự động.`,
        })
        // Có thể thêm logic gọi AI sàng lọc ở đây
      } else if ((oldStage === "cv-new" || oldStage === "screening") && targetStage === "bpcm-pending") {
        // VD6: Kéo từ "CV Mới" hoặc "Đang Sàng Lọc" -> "Chờ BPCM Duyệt"
        console.log("Triggering BPCM review") // Debug log
        toast({
          title: "Gửi CV đến BPCM",
          description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang ${newStageTitle}. BPCM sẽ nhận được thông báo để xem xét.`,
        })
      } else if (oldStage === "bpcm-pending" && targetStage === "bpcm-rejected") {
        // VD7: Kéo từ "Chờ BPCM Duyệt" -> "BPCM Từ Chối"
        console.log("BPCM rejected candidate") // Debug log
        toast({
          title: "BPCM đã từ chối",
          description: `BPCM đã từ chối ${candidate.hoVaTenDem} ${candidate.ten}. Ứng viên sẽ không tiếp tục quy trình.`,
        })
      } else if (oldStage === "bpcm-pending" && (targetStage === "knowledge-test" || targetStage === "interview-1")) {
        // VD8: Kéo từ "Chờ BPCM Duyệt" -> "Thi kỹ năng" hoặc "Phỏng vấn vòng 1"
        console.log("BPCM approved, moving to next stage") // Debug log
        toast({
          title: "BPCM đã đồng ý",
          description: `BPCM đã đồng ý ${candidate.hoVaTenDem} ${candidate.ten}. Chuyển sang ${newStageTitle}.`,
        })
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


  // Exam batch assignment handler
  const handleExamBatchAssignment = useCallback((batchId: string) => {
    // Find the selected batch to get exam date
    const selectedBatch = examBatches.find(batch => batch.id === batchId)
    const examDate = selectedBatch?.examDate ? new Date(selectedBatch.examDate).toLocaleDateString('vi-VN') : 'N/A'
    
    // Update selected candidates to scheduled-exam stage
    const selectedList = candidates.filter((c) => selectedCandidates.has(c.id))
    selectedList.forEach(candidate => {
      updateCandidateStage(candidate.id, "scheduled-exam" as any)
      // Update schedule with exam date
      updateCandidateSchedule(candidate.id, `Thi: ${examDate}`)
      // Save assigned batch id for filtering
      if (selectedBatch) {
        // @ts-ignore: store exposes updater
        if (typeof updateCandidateExamBatch === 'function') {
          // @ts-ignore
          updateCandidateExamBatch(candidate.id, selectedBatch.id)
        }
      }
    })

    toast({
      title: "Đã gán vào đợt thi",
      description: `Đã gán ${selectedList.length} ứng viên vào đợt thi ngày ${examDate}.`,
    })

    setExamBatchAssignmentOpen(false)
  }, [candidates, selectedCandidates, updateCandidateStage, updateCandidateSchedule, examBatches])

  const handleEmailSend = useCallback((emailData: any) => {
    if (emailCandidate) {
      // Record activity with the current email type
      addEmailActivity(emailCandidate.id, emailType, {
        subject: emailData.subject,
        interviewDate: emailData.interviewDate,
        interviewTime: emailData.interviewTime,
        sentAt: new Date().toISOString(),
      })

      // Mark email as sent for the correct stage
      const stageForEmail = (emailStageOverride as string) || emailCandidate.stage
      updateCandidateEmailStatus(emailCandidate.id, true, undefined, stageForEmail)

      // Toast with specific action label based on template type
      const stage = (emailStageOverride as string) || emailCandidate.stage
      const templateType = getTemplateTypeFromStage(stage, emailType)
      const actionLabel = templateTypeToLabel(templateType)

      toast({
        title: `Email ${actionLabel} đã được gửi`,
        description: `Đã gửi email ${actionLabel} cho ${emailCandidate.hoVaTenDem} ${emailCandidate.ten}`,
      })

      // After email is successfully sent, update stage/status accordingly
      if (emailType === "reject") {
        updateCandidateStage(emailCandidate.id, "rejected" as any)
        updateCandidateStatus(emailCandidate.id, "unsuitable")
      } else if (emailType === "offer") {
        // Handle offer email stage transitions
        if (emailCandidate.stage === "interview-2") {
          // From interview-2, move to offer stage (not hired yet)
          updateCandidateStage(emailCandidate.id, "offer" as any)
        } else if (emailStageOverride === "hired") {
          // From offer stage, move to hired
          updateCandidateStage(emailCandidate.id, "hired" as any)
        } else if (emailStageOverride === "offer") {
          // Health check email - stay in offer stage, don't change stage
          // No stage change needed
        }
      } else if (emailType === "interview" && emailStageOverride) {
        // Chuyển trạng thái dựa trên target stage
        if (emailStageOverride === "interview-1") {
          updateCandidateStage(emailCandidate.id, "interview-1" as any)
          // Update schedule with interview date
          if (emailData.interviewDate) {
            const interviewDate = new Date(emailData.interviewDate).toLocaleDateString('vi-VN')
            updateCandidateSchedule(emailCandidate.id, `PV V1: ${interviewDate}`)
          }
        } else if (emailStageOverride === "interview-2") {
          updateCandidateStage(emailCandidate.id, "interview-2" as any)
          // Reset interview result to pending when moving to interview-2
          updateCandidateInterviewResult(emailCandidate.id, "pending")
          // Update schedule with interview date
          if (emailData.interviewDate) {
            const interviewDate = new Date(emailData.interviewDate).toLocaleDateString('vi-VN')
            updateCandidateSchedule(emailCandidate.id, `PV V2: ${interviewDate}`)
          }
        }
      }

      // Clear override after handling
      setEmailStageOverride(null)
      
      // Close modal after successful send
      setEmailModalOpen(false)
      setEmailCandidate(null)
    }
  }, [emailCandidate, emailType, emailStageOverride, addEmailActivity, updateCandidateEmailStatus, updateCandidateStage, updateCandidateStatus, updateCandidateSchedule, updateCandidateInterviewResult, getTemplateTypeFromStage, templateTypeToLabel, toast])

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

  // Table view handlers
  const handleSelectCandidate = (candidateId: number, checked: boolean) => {
    const newSelected = new Set(selectedCandidates)
    if (checked) {
      newSelected.add(candidateId)
    } else {
      newSelected.delete(candidateId)
    }
    setSelectedCandidates(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(candidates.map(c => c.id))
      setSelectedCandidates(allIds)
    } else {
      setSelectedCandidates(new Set())
    }
  }

  const handleSort = (field: keyof Candidate) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedCandidates.size === 0) return

    switch (action) {
      case "change-status":
        // Open status change modal
        setStatusChangeModalOpen(true)
        break
      case "assign-exam-batch":
        // Open exam batch assignment modal
        setExamBatchAssignmentOpen(true)
        break
      case "send-email":
        // TODO: Implement bulk email
        toast({
          title: "Gửi email hàng loạt",
          description: `Đã chọn ${selectedCandidates.size} ứng viên để gửi email`,
        })
        break
      case "delete":
        // TODO: Implement bulk delete
        toast({
          title: "Xóa hàng loạt",
          description: `Đã chọn ${selectedCandidates.size} ứng viên để xóa`,
        })
        break
    }
  }

  // Handle bulk status change
  const handleBulkStatusChange = useCallback(() => {
    if (!newStatus) return

    const selectedList = candidates.filter((c) => selectedCandidates.has(c.id))
    selectedList.forEach(candidate => {
      updateCandidateStage(candidate.id, newStatus as any)
    })

    toast({
      title: "Đã thay đổi trạng thái hàng loạt",
      description: `Đã chuyển ${selectedList.length} ứng viên sang trạng thái mới`,
    })

    setStatusChangeModalOpen(false)
    setNewStatus("")
  }, [candidates, selectedCandidates, newStatus, updateCandidateStage])

  const handleStageChange = (candidateId: number, newStage: string) => {
    updateCandidateStage(candidateId, newStage as any)
    const candidate = candidates.find(c => c.id === candidateId)
    if (candidate) {
      toast({
        title: "Cập nhật giai đoạn",
        description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang giai đoạn mới`,
      })
    }
  }

  const handleInterviewResultChange = (candidateId: number, newResult: "pending" | "passed" | "rejected") => {
    // Update interview result in the store
    const candidate = candidates.find(c => c.id === candidateId)
    if (candidate) {
      updateCandidateInterviewResult(candidateId, newResult)
      
      toast({
        title: "Cập nhật kết quả phỏng vấn",
        description: `Đã cập nhật kết quả phỏng vấn cho ${candidate.hoVaTenDem} ${candidate.ten} thành ${newResult === "passed" ? "Đã pass" : newResult === "rejected" ? "Từ chối" : "Đang chờ"}`,
      })
    }
  }

  const activeDragCandidate = activeId ? candidates.find((c: Candidate) => c.id.toString() === activeId) : null

  // Helper: extract Date from schedule string like "PV V1: 25/11/2024" or "Thi: 30/10/2024"
  const extractDateFromSchedule = (schedule?: string): Date | null => {
    if (!schedule) return null
    const dateMatch = schedule.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (dateMatch) {
      const [, day, month, year] = dateMatch
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }
    return null
  }

  // Apply date filter to base candidates
  const dateFilteredCandidates = candidates.filter((c) => {
    if (!dateRange.from && !dateRange.to) return true
    const scheduleDate = extractDateFromSchedule(c.schedule)
    const fallbackDate = new Date(c.updatedAt)
    const target = scheduleDate || fallbackDate
    if (dateRange.from && target < new Date(dateRange.from.setHours(0,0,0,0))) return false
    if (dateRange.to && target > new Date(dateRange.to.setHours(23,59,59,999))) return false
    return true
  })

  // Table view data processing
  const sortedCandidates = [...dateFilteredCandidates].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    // Special handling for schedule field - extract date for sorting
    if (sortField === "schedule") {
      const aDate = extractDateFromSchedule(aValue as string)
      const bDate = extractDateFromSchedule(bValue as string)
      
      if (!aDate && !bDate) return 0
      if (!aDate) return 1
      if (!bDate) return -1
      
      if (aDate < bDate) return sortDirection === "asc" ? -1 : 1
      if (aDate > bDate) return sortDirection === "asc" ? 1 : -1
      return 0
    }
    
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return 1
    if (bValue === undefined) return -1
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex)

  // Bulk action: enable only when selected and same stage and same AI result
  const selectedCandidatesList = candidates.filter((c) => selectedCandidates.has(c.id))
  const hasUniformStage = selectedCandidatesList.length > 0 && (new Set(selectedCandidatesList.map((c) => c.stage))).size === 1
  
  // Check if all selected candidates have the same AI result
  const hasUniformAIResult = selectedCandidatesList.length > 0 && (new Set(selectedCandidatesList.map((c) => {
    if (c.score < 30) return "unsuitable"
    if (c.score >= 30 && c.score < 70) return "suitable-form2"
    return "suitable-form1"
  }))).size === 1

  // Email template helpers
  const getEmailTemplate = useCallback((type: "interview" | "offer" | "reject", targetStage?: string) => {
    const stage = targetStage || selectedCandidatesList[0]?.stage
    switch (type) {
      case "interview":
        if (stage === "knowledge-test") return "interview-knowledge-test"
        if (stage === "interview-1") return "interview-round-1"
        if (stage === "interview-2") return "interview-round-2"
        return "interview-round-1" // Default to round 1
      case "offer":
        if (stage === "interview-2") return "offer-congratulations" // After interview-2, send congratulations
        if (stage === "hired") return "offer-health-check"
        return "offer-congratulations"
      case "reject":
        return "reject"
      default:
        return "interview-round-1"
    }
  }, [])

  const getEmailSubject = useCallback((type: "interview" | "offer" | "reject", targetStage?: string) => {
    const templateType = getEmailTemplate(type, targetStage)
    const template = getTemplateByType(templateType as any)
    if (!template) return "Email từ Mobifone"
    
    // Replace placeholders with actual values
    const stage = targetStage || selectedCandidatesList[0]?.stage
    const position = selectedCandidatesList[0]?.viTri || "vị trí ứng tuyển"
    
    return template.subject
      .replace(/{{ViTriUngTuyen}}/g, position)
      .replace(/{{TenUngVien}}/g, "ứng viên")
  }, [getEmailTemplate, getTemplateByType, selectedCandidatesList])

  const getEmailContent = useCallback((type: "interview" | "offer" | "reject", targetStage?: string) => {
    const templateType = getEmailTemplate(type, targetStage)
    const template = getTemplateByType(templateType as any)
    if (!template) return "Nội dung email từ Mobifone"
    
    // Replace placeholders with actual values
    const stage = targetStage || selectedCandidatesList[0]?.stage
    const position = selectedCandidatesList[0]?.viTri || "vị trí ứng tuyển"
    
    return template.content
      .replace(/{{ViTriUngTuyen}}/g, position)
      .replace(/{{TenUngVien}}/g, "ứng viên")
      .replace(/{{ThoiGianPhongVan}}/g, "sẽ được thông báo sau")
      .replace(/{{NgayXacNhan}}/g, "5 ngày")
      .replace(/{{NgayBatDau}}/g, "sẽ được thông báo sau")
  }, [getEmailTemplate, getTemplateByType, selectedCandidatesList])

  // Bulk email helpers - open compose modal instead of sending immediately
  const bulkSendEmail = useCallback((type: "interview" | "offer" | "reject", targetStage?: string) => {
    if (!hasUniformStage) return
    
    // Set email type and template based on action
    setEmailType(type)
    const template = getEmailTemplate(type, targetStage)
    const subject = getEmailSubject(type, targetStage)
    const content = getEmailContent(type, targetStage)
    
    console.log('Bulk email setup:', { type, targetStage, template, subject, content })
    
    setBulkEmailTemplate(template)
    setBulkEmailSubject(subject)
    setBulkEmailContent(content)
    
    // Store the target stage for later use
    setEmailStageOverride(targetStage || selectedCandidatesList[0]?.stage || null)
    
    // Open compose modal
    setBulkEmailComposeOpen(true)
    setBulkMenuOpen(false)
  }, [hasUniformStage, getEmailTemplate, getEmailSubject, getEmailContent, selectedCandidatesList])

  // Handle bulk email send
  const handleBulkEmailSend = useCallback((emailData?: any) => {
    if (!hasUniformStage) return
    
    selectedCandidatesList.forEach(c => {
      addEmailActivity(c.id, emailType)
      const stageForEmail = emailStageOverride || c.stage
      updateCandidateEmailStatus(c.id, true, undefined, stageForEmail)
      
      if (emailType === "reject") {
        updateCandidateStage(c.id, "rejected" as any)
        updateCandidateStatus(c.id, "unsuitable")
      } else if (emailType === "offer") {
        // After interview-2, send congratulations and move to hired
        if (c.stage === "interview-2") {
          updateCandidateStage(c.id, "hired" as any)
        } else if (emailStageOverride === "hired") {
          updateCandidateStage(c.id, "hired" as any)
        }
      } else if (emailType === "interview" && emailStageOverride) {
        // Chuyển trạng thái dựa trên target stage
        if (emailStageOverride === "interview-1") {
          updateCandidateStage(c.id, "interview-1" as any)
          // Update schedule with actual interview date from email modal
          if (emailData && emailData.interviewDate) {
            const interviewDate = new Date(emailData.interviewDate).toLocaleDateString('vi-VN')
            updateCandidateSchedule(c.id, `PV V1: ${interviewDate}`)
          } else {
            updateCandidateSchedule(c.id, "PV V1: Sẽ thông báo sau")
          }
        } else if (emailStageOverride === "interview-2") {
          updateCandidateStage(c.id, "interview-2" as any)
          // Reset interview result to pending when moving to interview-2
          updateCandidateInterviewResult(c.id, "pending")
          // Update schedule with actual interview date from email modal
          if (emailData && emailData.interviewDate) {
            const interviewDate = new Date(emailData.interviewDate).toLocaleDateString('vi-VN')
            updateCandidateSchedule(c.id, `PV V2: ${interviewDate}`)
          } else {
            updateCandidateSchedule(c.id, "PV V2: Sẽ thông báo sau")
          }
        }
      }
    })
    
    toast({ 
      title: "Đã gửi email hàng loạt", 
      description: `Đã gửi ${emailType === 'interview' ? 'mời phỏng vấn' : emailType === 'offer' ? 'mời làm việc' : 'từ chối'} cho ${selectedCandidatesList.length} ứng viên` 
    })
    
    setBulkEmailComposeOpen(false)
    setEmailStageOverride(null)
  }, [hasUniformStage, emailType, emailStageOverride, selectedCandidatesList, addEmailActivity, updateCandidateEmailStatus, updateCandidateStage, updateCandidateStatus, updateCandidateSchedule, updateCandidateInterviewResult, toast])

  // Filter handlers to prevent infinite loops
  const handlePositionFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, position: value }))
  }, [])

  const handleStageFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, stage: value }))
  }, [])

  const handleStatusFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, status: value }))
  }, [])

  const handleExamBatchFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, examBatch: value }))
  }, [])

  // Thêm handler nguồn hồ sơ
  const handleSourceFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, source: value }))
  }, [])

  // Handler functions to prevent infinite loops
  const handleViewModeKanban = useCallback(() => {
    setViewMode("kanban")
  }, [])

  const handleViewModeTable = useCallback(() => {
    setViewMode("table")
  }, [])

  const handleBulkMenuToggle = useCallback(() => {
    setBulkMenuOpen(!bulkMenuOpen)
  }, [bulkMenuOpen])

  const handleBulkEmailKnowledgeTest = useCallback(() => {
    setBulkMenuOpen(false)
    bulkSendEmail("interview", "knowledge-test")
  }, [bulkSendEmail])

  const handleBulkEmailInterview1 = useCallback(() => {
    setBulkMenuOpen(false)
    bulkSendEmail("interview", "interview-1")
  }, [bulkSendEmail])

  const handleBulkEmailInterview2 = useCallback(() => {
    setBulkMenuOpen(false)
    bulkSendEmail("interview", "interview-2")
  }, [bulkSendEmail])

  const handleBulkEmailReject = useCallback(() => {
    setBulkMenuOpen(false)
    bulkSendEmail("reject")
  }, [bulkSendEmail])

  const handleBulkEmailOffer = useCallback(() => {
    setBulkMenuOpen(false)
    bulkSendEmail("offer")
  }, [bulkSendEmail])

  const handleBulkEmailHealthCheck = useCallback(() => {
    setBulkMenuOpen(false)
    bulkSendEmail("offer", "hired")
  }, [bulkSendEmail])

  const handleBulkEmailRejectResend = useCallback(() => {
    setBulkMenuOpen(false)
    bulkSendEmail("reject")
  }, [bulkSendEmail])


  const handleSortHoVaTenDem = useCallback(() => {
    handleSort("hoVaTenDem")
  }, [handleSort])

  const handleSortUpdatedAt = useCallback(() => {
    handleSort("updatedAt")
  }, [handleSort])

  const handleSortSchedule = useCallback(() => {
    handleSort("schedule")
  }, [handleSort])

  const handlePaginationPrevious = useCallback(() => {
    setCurrentPage(Math.max(1, currentPage - 1))
  }, [currentPage])

  const handlePaginationNext = useCallback(() => {
    setCurrentPage(Math.min(totalPages, currentPage + 1))
  }, [currentPage, totalPages])

  const handlePaginationPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Helper functions for table view
  const getStatusColor = (status: string) => {
    switch (status) {
      case "suitable":
      case "suitable-form1":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "suitable-form2":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "unsuitable":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {

      case "suitable-form1":
        return "Phù hợp (H1)"
      case "suitable-form2":
        return "Phù hợp (H2)"
      case "unsuitable":
        return "Không phù hợp"
      default:
        return "Chưa đánh giá"
    }
  }

  // Email helpers for labeling menu items with sent status per stage
  const getEmailMenuLabel = (candidateId: number, stage: string, baseLabel: string) => {
    const status = getEmailStatusForStage(candidateId, stage)
    return status.sent ? `Gửi lại ${baseLabel}` : `Gửi ${baseLabel}`
  }

  const EmailMenuItem = ({
    candidate,
    targetStage,
    baseLabel,
    type,
  }: {
    candidate: Candidate
    targetStage: string
    baseLabel: string
    type: "interview" | "offer" | "reject"
  }) => {
    const status = getEmailStatusForStage(candidate.id, targetStage)
    const label = status.sent ? `Gửi lại ${baseLabel}` : `Gửi ${baseLabel}`
    const tooltip = status.lastSent ? `Đã gửi lúc ${new Date(status.lastSent).toLocaleString('vi-VN')}` : undefined
    
    const handleEmailAction = useCallback(() => {
      setEmailCandidate(candidate)
      setEmailType(type)
      // Only remember intended target stage; do NOT change stage yet
      if (type === "reject") {
        setEmailStageOverride("rejected")
      } else if (type === "offer") {
        // For offer emails, track by target key (e.g., offer-congratulations, offer-health-check)
        setEmailStageOverride(targetStage)
      } else if (type === "interview") {
        setEmailStageOverride(targetStage)
      }
      setEmailModalOpen(true)
      // Close inline menu immediately after choosing an action
      setEmailMenuOpenId(null)
    }, [candidate, type, targetStage])
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleEmailAction}
              className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-foreground"
            >
              {status.sent && <Check className="!h-2 !w-2 text-green-600" style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px' }} />}
              <span>{label}</span>
            </button>
          </TooltipTrigger>
          {tooltip && (
            <TooltipContent>
              <span className="text-xs">{tooltip}</span>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Debug log to check if component is rendering
  console.log("HRAgentPage rendering with candidates:", candidates.length)

  // Keep selectedCandidate synced with latest store updates (stage/status changes)
  useEffect(() => {
    if (!selectedCandidate) return
    const latest = candidates.find(c => c.id === selectedCandidate.id)
    if (latest && (latest.stage !== selectedCandidate.stage || latest.status !== selectedCandidate.status || latest.updatedAt !== selectedCandidate.updatedAt)) {
      setSelectedCandidate(latest)
    }
  }, [candidates, selectedCandidate])

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
                <h1 className="text-2xl font-bold text-foreground">HR Agent - Quản lý Tuyển dụng</h1>
                <p className="text-sm text-muted-foreground mt-1">Quản lý và theo dõi quy trình tuyển dụng thông minh</p>
              </div>
              <div className="flex items-center gap-3">
                {/* View Toggle Buttons */}
                {/* <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === "kanban" ? "default" : "ghost"}
                    size="sm"
                    onClick={handleViewModeKanban}
                    className="gap-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Kanban
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={handleViewModeTable}
                    className="gap-2"
                  >
                    <Table className="h-4 w-4" />
                    Table
                  </Button>
                </div> */}

                {/* Primary Actions */}
                <Button 
                  className="gap-2 bg-primary hover:bg-primary/90" 
                  onClick={handleSyncCVs} 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                  Đồng bộ CV từ Email
                </Button>
                
                {/* {viewMode === "table" && (
                  <Button 
                    variant="outline" 
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm ứng viên
                  </Button>
                )} */}

                {/* Bulk Actions (only in table view) */}
                {viewMode === "table" && (
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      disabled={!hasUniformStage || !hasUniformAIResult}
                      className="gap-2"
                      onClick={handleBulkMenuToggle}
                      aria-haspopup="menu"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      Hành động hàng loạt ({selectedCandidates.size})
                    </Button>
                    {bulkMenuOpen && (
                      <div className="absolute right-0 top-10 z-[9999] w-56 rounded-md border bg-popover text-popover-foreground shadow-md p-1" role="menu">
                        {/* General bulk actions */}
                        <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => { handleBulkAction("change-status"); setBulkMenuOpen(false); }}>
                          Thay đổi trạng thái
                        </button>
                        
                        {/* Context-aware options based on uniform stage */}
                        {selectedCandidatesList[0]?.stage === "waiting-exam-schedule" && (
                          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => { handleBulkAction("assign-exam-batch"); setBulkMenuOpen(false); }}>
                            Gán vào Đợt thi
                          </button>
                        )}
                        {selectedCandidatesList[0]?.stage === "scheduled-exam" && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Đã xếp lịch thi - Chờ thi
                          </div>
                        )}
                        {selectedCandidatesList[0]?.stage === "pass-test" && (
                          <>
                            <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={handleBulkEmailInterview1}>Mời phỏng vấn vòng 1</button>
                            <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive" onClick={handleBulkEmailReject}>Gửi thư từ chối</button>
                          </>
                        )}
                        {selectedCandidatesList[0]?.stage === "fail-test" && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Không đạt thi - Kết thúc quy trình
                          </div>
                        )}
                        
                        {selectedCandidatesList[0]?.stage === "cv-new" && (
                          <>
                            {/* Kiểm tra kết quả AI của nhóm được chọn */}
                            {(() => {
                              const aiResults = selectedCandidatesList.map(c => {
                                if (c.score < 30) return "unsuitable"
                                if (c.score >= 30 && c.score < 70) return "suitable-form2"
                                return "suitable-form1"
                              })
                              const uniqueResults = [...new Set(aiResults)]
                              
                              // Nếu tất cả cùng kết quả AI
                              if (uniqueResults.length === 1) {
                                const aiResult = uniqueResults[0]
                                if (aiResult === "suitable-form1") {
                                  return (
                                    <>
                                      <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={() => { handleBulkEmailInterview1(); setBulkMenuOpen(false); }}>Mời phỏng vấn vòng 1</button>
                                      <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive" onClick={() => { handleBulkEmailReject(); setBulkMenuOpen(false); }}>Gửi thư từ chối</button>
                                    </>
                                  )
                                } else if (aiResult === "suitable-form2") {
                                  return (
                                    <>
                                      <button 
                                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                                        onClick={() => {
                                          // Chuyển tất cả sang chờ xếp lịch thi
                                          selectedCandidatesList.forEach(c => {
                                            updateCandidateStage(c.id, "waiting-exam-schedule")
                                          })
                                          setBulkMenuOpen(false)
                                          toast({
                                            title: "Chuyển trạng thái thành công",
                                            description: `Đã chuyển ${selectedCandidatesList.length} ứng viên sang "Chờ xếp lịch thi"`,
                                          })
                                        }}
                                      >
                                        Sắp xếp lịch thi
                                      </button>
                                      <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive" onClick={() => { handleBulkEmailReject(); setBulkMenuOpen(false); }}>Gửi thư từ chối</button>
                                    </>
                                  )
                                } else {
                                  return (
                                    <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive" onClick={() => { handleBulkEmailReject(); setBulkMenuOpen(false); }}>Gửi thư từ chối</button>
                                  )
                                }
                              } else {
                                // Nếu có nhiều kết quả AI khác nhau
                                return (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Nhóm có kết quả AI khác nhau - Vui lòng chọn từng nhóm riêng biệt
                                  </div>
                                )
                              }
                            })()}
                          </>
                        )}
                        {selectedCandidatesList[0]?.stage === "knowledge-test" && (
                          <>
                            <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={handleBulkEmailInterview1}>Mời phỏng vấn vòng 1</button>
                            <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive" onClick={handleBulkEmailReject}>Gửi thư từ chối</button>
                          </>
                        )}
                        {selectedCandidatesList[0]?.stage === "interview-1" && (
                          <>
                            {(() => {
                              // Check if all selected candidates have the same interview result
                              const interviewResults = selectedCandidatesList.map(c => c.interviewResult || "pending")
                              const uniqueResults = [...new Set(interviewResults)]
                              
                              if (uniqueResults.length === 1) {
                                const result = uniqueResults[0]
                                if (result === "passed") {
                                  return (
                                    <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={handleBulkEmailInterview2}>Mời phỏng vấn vòng 2</button>
                                  )
                                } else if (result === "rejected") {
                                  return (
                                    <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive" onClick={handleBulkEmailReject}>Gửi thư từ chối</button>
                                  )
                                } else {
                                  return (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                      Đang chờ kết quả phỏng vấn vòng 1
                                    </div>
                                  )
                                }
                              } else {
                                return (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Nhóm có kết quả phỏng vấn khác nhau - Vui lòng chọn từng nhóm riêng biệt
                                  </div>
                                )
                              }
                            })()}
                          </>
                        )}
                        {selectedCandidatesList[0]?.stage === "interview-2" && (
                          <>
                            {(() => {
                              // Check if all selected candidates have the same interview result
                              const interviewResults = selectedCandidatesList.map(c => c.interviewResult || "pending")
                              const uniqueResults = [...new Set(interviewResults)]
                              
                              if (uniqueResults.length === 1) {
                                const result = uniqueResults[0]
                                if (result === "passed") {
                                  return (
                                    <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={handleBulkEmailOffer}>Gửi thư chúc mừng trúng tuyển</button>
                                  )
                                } else if (result === "rejected") {
                                  return (
                                    <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive" onClick={handleBulkEmailReject}>Gửi thư từ chối</button>
                                  )
                                } else {
                                  return (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                      Đang chờ kết quả phỏng vấn vòng 2
                                    </div>
                                  )
                                }
                              } else {
                                return (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Nhóm có kết quả phỏng vấn khác nhau - Vui lòng chọn từng nhóm riêng biệt
                                  </div>
                                )
                              }
                            })()}
                          </>
                        )}
                        {selectedCandidatesList[0]?.stage === "hired" && (
                          <>
                            <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={handleBulkEmailHealthCheck}>Gửi hướng dẫn khám sức khỏe</button>
                          </>
                        )}
                        {selectedCandidatesList[0]?.stage === "rejected" && (
                          <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm" onClick={handleBulkEmailReject}>Gửi lại thư từ chối</button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Nút tải tất cả CV đã được di chuyển xuống trên bảng bên phải */}
                {/* <Button 
                  variant="outline" 
                  className="gap-2 bg-transparent hover:bg-accent"
                  onClick={handleDownloadAll}
                >
                  <Download className="h-4 w-4" />
                  Tải tất cả CV
                </Button> */}
                {/* Notifications */}
                <Popover open={notificationPopoverOpen} onOpenChange={setNotificationPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Button variant="outline" size="icon" className="bg-transparent hover:bg-accent">
                        <Bell className="h-4 w-4" />
                      </Button>
                      {(() => {
                        const newCVs = candidates.filter(c => c.stage === 'cv-new').length
                        let bpcmApproved = 0, bpcmRejected = 0
                        candidates.forEach(c => {
                          (c.bpcmReviews || []).forEach((r: BPCMReview) => {
                            if (r.status === 'approved') bpcmApproved++
                            if (r.status === 'rejected') bpcmRejected++
                          })
                        })
                        const total = newCVs + bpcmApproved + bpcmRejected
                        return total > 0 ? (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                            {total}
                          </span>
                        ) : null
                      })()}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-80 overflow-y-auto p-0">
                    {function renderNotifications() {
                      const notifications: {id:number; name:string; text:string; kind:'cv'|'approved'|'rejected'}[] = []
                      candidates.forEach((c: Candidate) => {
                        if (c.stage === 'cv-new') notifications.push({ id: c.id, name: `${c.hoVaTenDem} ${c.ten}`, text: 'CV mới', kind:'cv'})  
                        ;(c.bpcmReviews||[]).forEach((r: BPCMReview) => {
                          if (r.status === 'approved') notifications.push({ id: c.id, name: `${c.hoVaTenDem} ${c.ten}`, text: `BPCM đồng ý (${r.departmentName})`, kind:'approved'})
                          if (r.status === 'rejected') notifications.push({ id: c.id, name: `${c.hoVaTenDem} ${c.ten}`, text: `BPCM từ chối (${r.departmentName})`, kind:'rejected'})
                        })
                      })
                      if (notifications.length === 0) return <div className="p-3 text-sm text-muted-foreground">Chưa có thông báo</div>
                      const handleJump = (id:number) => {
                        // Close the popover first
                        setNotificationPopoverOpen(false)
                        
                        const el = document.getElementById(`row-${id}`)
                        if (el) {
                          el.scrollIntoView({ behavior:'smooth', block:'center'})
                          
                          // Simple focus effect - appears once and fades out
                          el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'bg-primary/5', 'shadow-lg', 'scale-[1.02]', 'transition-all', 'duration-300')
                          setTimeout(() => {
                            el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'bg-primary/5', 'shadow-lg', 'scale-[1.02]', 'transition-all', 'duration-300')
                          }, 2000)
                        }
                      }
                      return (
                        <div className="divide-y">
                          {notifications.slice(0, 30).map(it => {
                            const Icon = it.kind === 'cv' ? FileText : it.kind === 'approved' ? Check : XCircle
                            const iconClass = it.kind === 'approved' ? 'text-green-600' : it.kind === 'rejected' ? 'text-red-600' : 'text-blue-600'
                            return (
                              <button
                                key={`${it.kind}-${it.id}`}
                                onClick={()=>handleJump(it.id)}
                                className="w-full flex items-start gap-3 px-3 py-2 hover:bg-muted/60"
                              >
                                <Icon className={`h-4 w-4 mt-0.5 ${iconClass}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground truncate">{it.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">{it.text}</div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )
                    }()}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </header>

          {/* Filter Bar */}
          <div className="border-b border-border bg-card px-6 py-4">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Các filter select ở đây như cũ   */}
              {/* ... */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Vị trí tuyển dụng</label>
                <Select value={filters.position} onValueChange={handlePositionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Array.from(POSITION_NAMES).map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bộ lọc nguồn hồ sơ */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Nguồn hồ sơ</label>
                <Select value={(filters as any).source || "all"} onValueChange={handleSourceFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Array.from(new Set(candidates.map(c => c.nguonHoSo).filter(Boolean))).map((src: any) => (
                      <SelectItem key={src} value={src}>{src}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Thời gian - đặt giữa Nguồn hồ sơ và Trạng thái */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Thời gian</label>
                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                  <PopoverTrigger>
                    <Button
                      variant="outline"
                      className="w-64 justify-start text-left font-normal"
                      type="button"
                      onClick={() => setDatePopoverOpen(true)}
                    >
                      {dateRange.from || dateRange.to ? (
                        <span>
                          {dateRange.from ? new Date(dateRange.from).toLocaleDateString('vi-VN') : ''}
                          {' '} - {' '}
                          {dateRange.to ? new Date(dateRange.to).toLocaleDateString('vi-VN') : ''}
                        </span>
                      ) : (
                        <span>Chọn khoảng ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent forceMount className="w-auto p-0" align="start" side="bottom">
                    <div className="p-2 border-b flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => {
                          const today = new Date()
                          setDateRange({ from: today, to: today })
                          setDatePopoverOpen(false)
                        }}
                      >Hôm nay</Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => {
                          const end = new Date()
                          const start = new Date()
                          start.setDate(end.getDate() - 6)
                          setDateRange({ from: start, to: end })
                          setDatePopoverOpen(false)
                        }}
                      >7 ngày qua</Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => {
                          const now = new Date()
                          const start = new Date(now.getFullYear(), now.getMonth(), 1)
                          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                          setDateRange({ from: start, to: end })
                          setDatePopoverOpen(false)
                        }}
                      >Tháng này</Button>
                    </div>
                    <CalendarComponent
                      mode="range"
                      numberOfMonths={1}
                      captionLayout="dropdown"
                      selected={dateRange as any}
                      onSelect={(range: any) => {
                        setDateRange(range || {})
                        if (range?.from && range?.to) {
                          setDatePopoverOpen(false)
                        }
                      }}
                      initialFocus
                    />
                    <div className="flex items-center justify-between gap-2 p-2 border-t">
                      <Button variant="ghost" size="sm" type="button" onClick={() => { setDateRange({}); }}>Xóa</Button>
                      <Button size="sm" type="button" onClick={() => setDatePopoverOpen(false)}>Đóng</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                <Select value={filters.stage} onValueChange={handleStageFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="cv-new">CV Mới</SelectItem>
                    <SelectItem value="knowledge-test">Vòng Thi Kiến Thức, Kỹ Năng</SelectItem>
                    <SelectItem value="waiting-exam-schedule">Chờ xếp lịch thi</SelectItem>
                    <SelectItem value="scheduled-exam">Đã xếp lịch thi</SelectItem>
                    <SelectItem value="pass-test">Đạt thi</SelectItem>
                    <SelectItem value="fail-test">Không đạt thi</SelectItem>
                    <SelectItem value="interview-1">Tham Dự Phỏng Vấn Vòng 1</SelectItem>
                    <SelectItem value="interview-2">Tham Dự Phỏng Vấn Vòng 2</SelectItem>
                    <SelectItem value="offer">Nhân Sự Chính Thức</SelectItem>
                    <SelectItem value="hired">Đã Tuyển</SelectItem>
                    <SelectItem value="rejected">Từ Chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Kết quả sàng lọc AI</label>
                <Select value={filters.status} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn kết quả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="suitable">Phù hợp</SelectItem>
                    <SelectItem value="suitable-form1">Phù hợp (H1)</SelectItem>
                    <SelectItem value="suitable-form2">Phù hợp (H2)</SelectItem>
                    <SelectItem value="unsuitable">Không phù hợp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Đợt thi</label>
                <Select value={(filters as any).examBatch || "all"} onValueChange={handleExamBatchFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Chọn đợt thi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {examBatches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name} ({new Date(b.examDate).toLocaleDateString('vi-VN')})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full flex items-end gap-2 mt-4">
                <div className="flex flex-col gap-1 flex-1 max-w-sm">
                  <label className="text-sm font-medium text-muted-foreground">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm ứng viên theo tên, email, kỹ năng..."
                      value={filters.search}
                      onChange={(e) => {
                        setFilters({ ...filters, search: e.target.value })
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                {/* Nút xuất CV đặt ngang hàng với tìm kiếm/thời gian */}
                <div className="ml-auto self-end">
                  <Button 
                    variant="outline" 
                    className="gap-2 bg-transparent hover:bg-accent"
                    onClick={handleDownloadAll}
                  >
                    <Download className="h-4 w-4" />
                    Xuất CV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {viewMode === "kanban" ? (
              /* Kanban Board */
              <div className="h-full overflow-x-auto overflow-y-auto p-6">
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
            ) : (
              /* Table View */
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                 
                  <div className="relative">
                    <TableComponent>
                      <TableHeader className="sticky top-0 bg-background z-20 border-b shadow-sm">
                        <TableRow className="bg-background">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedCandidates.size === candidates.length && candidates.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={handleSortHoVaTenDem}
                        >
                          Họ và tên
                        </TableHead>
                        <TableHead>Vị trí ứng tuyển</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={handleSortUpdatedAt}
                        >
                          Ngày nộp
                        </TableHead>
                        <TableHead>Kết quả AI</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Kết quả phỏng vấn</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={handleSortSchedule}
                        >
                          Lịch trình
                        </TableHead>
                        <TableHead className="w-32">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCandidates.map((candidate, index) => (
                        <TableRow key={candidate.id} id={`row-${candidate.id}`} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedCandidates.has(candidate.id)}
                              onCheckedChange={(checked) => handleSelectCandidate(candidate.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div 
                              className="font-medium hover:text-primary" 
                              onClick={() => handleCandidateClick(candidate)}
                              style={{ cursor: 'pointer' }}
                            >
                              {candidate.hoVaTenDem} {candidate.ten}
                            </div>
                            <div className="text-sm text-muted-foreground">{candidate.email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{candidate.viTri}</span>
                              <span className="text-xs text-muted-foreground">Nguồn: {candidate.nguonHoSo || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(candidate.updatedAt).toLocaleDateString('vi-VN')}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const aiStatus = getAIStatusFromScore(candidate.score)
                              return (
                                <Badge className={`text-xs ${getStatusColor(aiStatus)}`}>
                                  {getStatusText(aiStatus)}
                                </Badge>
                              )
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const stage = candidate.stage
                              const cls = stage === "cv-new" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : stage === "screening" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                : stage === "bpcm-pending" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                : stage === "bpcm-rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : stage === "knowledge-test" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                : stage === "pass-test" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : stage === "fail-test" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : stage === "interview-1" ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                                : stage === "interview-2" ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
                                : stage === "offer" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                                : stage === "hired" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : stage === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-muted text-foreground"
                              return (
                                <div className="flex items-center gap-1">
                                  <Badge className={`text-xs ${cls}`}>
                                    {stages.find(s => s.id === candidate.stage)?.title || candidate.stage}
                                  </Badge>
                                  {candidate.stage === "offer" && candidate.emailStatusByStage?.["offer"]?.sent && (
                                    <Badge variant="outline" className="text-[10px] text-green-700 border-green-600">Đã gửi KSK</Badge>
                                  )}
                                </div>
                              )
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              // Only show interview result for interview stages
                              if (candidate.stage === "interview-1" || candidate.stage === "interview-2") {
                                const result = candidate.interviewResult || "pending"
                                const getInterviewResultColor = (result: string) => {
                                  switch (result) {
                                    case "passed":
                                      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    case "rejected":
                                      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                    case "pending":
                                    default:
                                      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  }
                                }
                                const getInterviewResultText = (result: string) => {
                                  switch (result) {
                                    case "passed":
                                      return "Đã pass"
                                    case "rejected":
                                      return "Từ chối"
                                    case "pending":
                                    default:
                                      return "Đang chờ"
                                  }
                                }
                                return (
                                  <Select
                                    value={result}
                                    onValueChange={(value: "pending" | "passed" | "rejected") => 
                                      handleInterviewResultChange(candidate.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                          Đang chờ
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="passed">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-green-500" />
                                          Đã pass
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="rejected">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-red-500" />
                                          Từ chối
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                )
                              }
                              return <span className="text-muted-foreground text-sm">-</span>
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {candidate.schedule ? (
                                <span className="text-blue-600 font-medium">{candidate.schedule}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCandidateClick(candidate)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEmailMenuClick(candidate.id)}
                                  aria-haspopup="menu"
                                  aria-controls={`email-inline-menu-${candidate.id}`}
                                  className={emailMenuOpenId === candidate.id ? "bg-accent" : ""}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                {emailMenuOpenId === candidate.id && (
                                  <>
                                    {/* Backdrop to ensure menu is not obscured */}
                                    <div 
                                      className="fixed inset-0 z-[9998]" 
                                      onClick={() => setEmailMenuOpenId(null)}
                                    />
                                    <div
                                      id={`email-inline-menu-${candidate.id}`}
                                      className={`absolute right-0 z-[9999] w-72 rounded-md border bg-popover text-popover-foreground shadow-lg p-1 transition-all duration-200 ${
                                        // Check if this is one of the last items in the list (last 3 items)
                                        index >= paginatedCandidates.length - 3 
                                          ? 'bottom-8' 
                                          : 'top-8'
                                      }`}
                                      role="menu"
                                    >
                                    {/* Context-aware email actions by stage */}
                                  {candidate.stage === "cv-new" && (
                                    <>
                                      {/* Phù hợp (H1) - Mời phỏng vấn trực tiếp */}
                                      {candidate.score >= 70 && (
                                        <>
                                          <EmailMenuItem candidate={candidate} targetStage="interview-1" baseLabel="mời phỏng vấn vòng 1" type="interview" />
                                          <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                        </>
                                      )}
                                      
                                      {/* Phù hợp (H2) - Cần thi kỹ năng */}
                                      {candidate.score >= 30 && candidate.score < 70 && (
                                        <>
                                          <button 
                                            className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-foreground"
                                            onClick={() => {
                                              // Chuyển sang chờ xếp lịch thi
                                              updateCandidateStage(candidate.id, "waiting-exam-schedule")
                                              setEmailMenuOpenId(null)
                                              toast({
                                                title: "Chuyển trạng thái thành công",
                                                description: `Đã chuyển ${candidate.hoVaTenDem} ${candidate.ten} sang "Chờ xếp lịch thi"`,
                                              })
                                            }}
                                          >
                                            <Users className="h-4 w-4" />
                                            Sắp xếp lịch thi
                                          </button>
                                          <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                        </>
                                      )}
                                      
                                      {/* Không phù hợp */}
                                      {candidate.score < 30 && (
                                        <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                      )}
                                    </>
                                  )}
                                  {candidate.stage === "knowledge-test" && (
                                    <>
                                      <EmailMenuItem candidate={candidate} targetStage="interview-1" baseLabel="mời phỏng vấn vòng 1" type="interview" />
                                      <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                    </>
                                  )}
                                  {candidate.stage === "waiting-exam-schedule" && (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                      Chờ xếp lịch thi - Sử dụng "Hành động hàng loạt" để gán vào đợt thi
                                    </div>
                                  )}
                                  {candidate.stage === "scheduled-exam" && (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                      Đã xếp lịch thi - Chờ thi
                                    </div>
                                  )}
                                  {candidate.stage === "pass-test" && (
                                    <>
                                      <EmailMenuItem candidate={candidate} targetStage="interview-1" baseLabel="mời phỏng vấn vòng 1" type="interview" />
                                      <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                    </>
                                  )}
                                  {candidate.stage === "fail-test" && (
                                    <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                  )}
                                  {candidate.stage === "interview-1" && (
                                    <>
                                      {(() => {
                                        const interviewResult = candidate.interviewResult || "pending"
                                        if (interviewResult === "passed") {
                                          return (
                                            <EmailMenuItem candidate={candidate} targetStage="interview-2" baseLabel="mời phỏng vấn vòng 2" type="interview" />
                                          )
                                        } else if (interviewResult === "rejected") {
                                          return (
                                            <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                          )
                                        } else {
                                          // pending - no actions available
                                          return (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                              Đang chờ kết quả phỏng vấn
                                            </div>
                                          )
                                        }
                                      })()}
                                    </>
                                  )}
                                  {candidate.stage === "interview-2" && (
                                    <>
                                      {(() => {
                                        const interviewResult = candidate.interviewResult || "pending"
                                        if (interviewResult === "passed") {
                                          return (
                                            <EmailMenuItem candidate={candidate} targetStage="offer-congratulations" baseLabel="thư mời làm việc" type="offer" />
                                          )
                                        } else if (interviewResult === "rejected") {
                                          return (
                                            <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                          )
                                        } else {
                                          // pending - no actions available
                                          return (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                              Đang chờ kết quả phỏng vấn vòng 2
                                            </div>
                                          )
                                        }
                                      })()}
                                    </>
                                  )}
                                  {candidate.stage === "offer" && (
                                    <>
                                      <EmailMenuItem candidate={candidate} targetStage="offer-congratulations" baseLabel="thư mời làm việc" type="offer" />
                                      <EmailMenuItem candidate={candidate} targetStage="offer-health-check" baseLabel="hướng dẫn khám sức khỏe" type="offer" />
                                    </>
                                  )}
                                  {candidate.stage === "hired" && (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Đã tuyển dụng</div>
                                  )}
                                  {candidate.stage === "rejected" && (
                                    <EmailMenuItem candidate={candidate} targetStage="rejected" baseLabel="thư từ chối" type="reject" />
                                  )}
                                  </div>
                                  </>
                                )}
                              </div>
                              {/* Nút ... đã được loại bỏ theo yêu cầu (không có action) */}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableComponent>
                  </div>
                </div>
                
                {/* Pagination */}
                <div className="border-t border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {startIndex + 1}-{Math.min(endIndex, sortedCandidates.length)} trong {sortedCandidates.length} ứng viên
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={handlePaginationPrevious}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePaginationPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={handlePaginationNext}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </div>
            )}
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
          onScheduleUpdate={updateCandidateSchedule}
          onInterviewResultUpdate={updateCandidateInterviewResult}
          allCandidates={candidates}
          onEmailStatusUpdate={(id, key) => {
            // map key to stage buckets for status tracking
            let stageKey = key
            // Persist per action in emailStatusByStage using existing updater
            updateCandidateEmailStatus(id, true, undefined, stageKey)
          }}
        />
      )}

      {/* Auto-triggered Email Modal for Interview Invitations */}
      {emailCandidate && (
        <EmailCompositionModal
          isOpen={emailModalOpen}
          onClose={() => {
            setEmailModalOpen(false)
            setEmailCandidate(null)
            setEmailStageOverride(null)
          }}
          onSend={handleEmailSend}
          candidate={{
            id: emailCandidate.id, // Added missing id field
            name: `${emailCandidate.hoVaTenDem} ${emailCandidate.ten}`,
            email: emailCandidate.email,
            position: emailCandidate.viTri,
          }}
          emailType={emailType}
          templateType={(() => {
            const stage = emailStageOverride || emailCandidate.stage
            const templateType = getTemplateTypeFromStage(stage, emailType)
            console.log("HR Agent - Stage:", stage, "EmailType:", emailType, "TemplateType:", templateType)
            console.log("HR Agent - EmailStageOverride:", emailStageOverride, "EmailCandidate.stage:", emailCandidate.stage)
            return templateType
          })()}
        />
      )}


      {/* Bulk Email Compose Modal */}
      <EmailCompositionModal
        isOpen={bulkEmailComposeOpen}
        onClose={() => {
          setBulkEmailComposeOpen(false)
          setEmailStageOverride(null)
        }}
        candidate={selectedCandidatesList[0] ? {
          id: selectedCandidatesList[0].id,
          name: `${selectedCandidatesList[0].hoVaTenDem} ${selectedCandidatesList[0].ten}`,
          email: selectedCandidatesList[0].email,
          position: selectedCandidatesList[0].viTri
        } : null}
        emailType={emailType}
        onSend={handleBulkEmailSend}
        isBulkMode={true}
        bulkRecipients={selectedCandidatesList.map(c => ({
          id: c.id,
          name: `${c.hoVaTenDem} ${c.ten}`,
          email: c.email,
          position: c.viTri
        }))}
        bulkSubject={bulkEmailSubject}
        bulkContent={bulkEmailContent}
        bulkTemplate={bulkEmailTemplate}
      />

      {/* Exam Batch Assignment Modal */}
      <ExamBatchAssignmentModal
        isOpen={examBatchAssignmentOpen}
        onClose={() => setExamBatchAssignmentOpen(false)}
        onSubmit={handleExamBatchAssignment}
        selectedCandidates={selectedCandidatesList}
        availableBatches={examBatches.filter(batch => batch.status === "open")}
      />

      {/* Status Change Modal */}
      <Dialog open={statusChangeModalOpen} onOpenChange={setStatusChangeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thay đổi trạng thái hàng loạt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Chọn trạng thái mới</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Chọn trạng thái..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cv-new">CV Mới</SelectItem>
                  <SelectItem value="knowledge-test">Vòng Thi Kiến Thức, Kỹ Năng</SelectItem>
                  <SelectItem value="waiting-exam-schedule">Chờ xếp lịch thi</SelectItem>
                  <SelectItem value="scheduled-exam">Đã xếp lịch thi</SelectItem>
                  <SelectItem value="pass-test">Đạt thi</SelectItem>
                  <SelectItem value="fail-test">Không đạt thi</SelectItem>
                  <SelectItem value="interview-1">Tham dự phỏng vấn vòng 1</SelectItem>
                  <SelectItem value="interview-2">Tham dự phỏng vấn vòng 2</SelectItem>
                  <SelectItem value="offer">Nhân sự chính thức</SelectItem>
                  <SelectItem value="hired">Đã Tuyển</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStatusChangeModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleBulkStatusChange} disabled={!newStatus}>
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedRoute>
  )
}
