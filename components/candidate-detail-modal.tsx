"use client"

import { EmailCompositionModal } from "@/components/email-composition-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import type { Candidate } from "@/lib/types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Award,
  Briefcase,
  CheckCircle,
  Download, FileSpreadsheet, GraduationCap,
  Mail,
  Phone,
  UserCheck,
  UserX,
  XCircle
} from "lucide-react"
import { useEffect, useState } from "react"

interface CandidateDetailModalProps {
  candidate: Candidate
  isOpen: boolean
  onClose: () => void
  onSendEmail: (type: "interview" | "offer" | "reject") => void
  onNotesUpdate?: (candidateId: number, notes: string) => void
  onStatusUpdate?: (candidateId: number, status: Candidate["status"]) => void
  onStageUpdate?: (candidateId: number, stage: string) => void
  allCandidates?: Candidate[]
  // Trigger BPCM department selector from parent
  onOpenBPCMSelector?: (candidate: Candidate) => void
  // Optional BPCM decision callbacks (used in BPCM page)
  onBPCMApprove?: () => void
  onBPCMReject?: () => void
  // Update per-action email status so email icon menu shows "Gửi lại ..."
  onEmailStatusUpdate?: (candidateId: number, key: string) => void
}

export function CandidateDetailModal({
  candidate,
  isOpen,
  onClose,
  onSendEmail,
  onNotesUpdate,
  onStatusUpdate,
  onStageUpdate,
  allCandidates = [],
  onOpenBPCMSelector,
  onBPCMApprove,
  onBPCMReject,
  onEmailStatusUpdate,
}: CandidateDetailModalProps) {
  const [notes, setNotes] = useState(candidate.notes || "")
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailType, setEmailType] = useState<"interview" | "offer" | "reject">("interview")
  const [templateType, setTemplateType] = useState<string | undefined>(undefined)

  // Update notes when candidate changes
  useEffect(() => {
    setNotes(candidate.notes || "")
  }, [candidate.notes])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "suitable":
        return "bg-success text-success-foreground"
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
      case "unsuitable":
        return "Không phù hợp"
      default:
        return "Chưa đánh giá"
    }
  }

  // Function to download Excel file
  const downloadExcel = (candidates: Candidate[], filename: string) => {
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
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = () => {
    downloadExcel(allCandidates, `tat_ca_ung_vien_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleDownloadNewCVs = () => {
    const newCVs = allCandidates.filter((c: Candidate) => c.stage === "cv-new")
    downloadExcel(newCVs, `cv_moi_${new Date().toISOString().split('T')[0]}.csv`)
  }

  // Mock screening criteria results
  const screeningResults = [
    { criteria: "Kinh nghiệm > 3 năm", passed: candidate.kinhNghiemLamViec >= 3 },
    { criteria: "Có kinh nghiệm React/Next.js", passed: candidate.skills.some((skill) => skill.includes("React")) },
    { criteria: "Tốt nghiệp đại học", passed: true },
    { criteria: "TOEIC >= 550", passed: candidate.score >= 80 },
    { criteria: "Có kinh nghiệm TypeScript", passed: candidate.skills.includes("TypeScript") },
  ]

  const handleEmailAction = (type: "interview" | "offer" | "reject", tpl?: string) => {
    setEmailType(type)
    setTemplateType(tpl)
    setEmailModalOpen(true)
  }

  const handleEmailSend = (emailData: any) => {
    console.log("Email sent:", emailData)
    onSendEmail(emailType)

    // Determine next stage based on current stage and templateType
    if (onStageUpdate) {
      const currentStage = candidate.stage
      const tpl = templateType
      let nextStage: Candidate["stage"] | undefined

      if (currentStage === "bpcm-approved") {
        if (tpl === "interview-knowledge-test") nextStage = "knowledge-test"
        else if (tpl === "interview-round-1") nextStage = "interview-1"
        else if (emailType === "reject" || tpl === "reject") nextStage = "rejected"
      } else if (currentStage === "knowledge-test") {
        if (tpl === "interview-round-1") nextStage = "interview-1"
      } else if (currentStage === "interview-1") {
        if (tpl === "interview-round-2") nextStage = "interview-2"
      } else if (currentStage === "interview-2") {
        if (tpl === "offer-congratulations" || emailType === "offer") nextStage = "offer"
      } else if (currentStage === "offer") {
        // Stay in offer; emails can be resent (congrats) or send health-check
        nextStage = undefined
      }

      if (nextStage) {
        onStageUpdate(candidate.id, nextStage)
      }
    }

    // Mark specific email action as sent (for menu labels)
    if (onEmailStatusUpdate) {
      const key = templateType || emailType
      // For offer flows ensure we use explicit keys
      if (key === "offer-congratulations" || key === "offer-health-check") {
        onEmailStatusUpdate(candidate.id, key)
      }
      if (key === "interview-knowledge-test" || key === "interview-round-1" || key === "interview-round-2" || key === "reject") {
        onEmailStatusUpdate(candidate.id, key)
      }
    }

    // Reset template hint for next open
    setTemplateType(undefined)
  }

  const handleNotesBlur = () => {
    if (onNotesUpdate && notes !== candidate.notes) {
      onNotesUpdate(candidate.id, notes)
    }
  }

  const handleStatusUpdate = (status: Candidate["status"]) => {
    if (onStatusUpdate) {
      onStatusUpdate(candidate.id, status)
    }
    
    // Nếu "Không phù hợp" thì chuyển sang cột "Từ chối"
    if (status === "unsuitable" && onStageUpdate) {
      onStageUpdate(candidate.id, "rejected")
      onClose()
      if (typeof document !== 'undefined') {
        const el = document.getElementById('stage-rejected')
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      }
    }

    // Nếu "Phù hợp" ở CV mới: mở popup chọn phòng BPCM, KHÔNG đổi stage
    if (status === "suitable" && candidate.stage === "cv-new") {
      if (onOpenBPCMSelector) {
        onOpenBPCMSelector(candidate)
      }
      onClose()
      return
    }
    // Các trường hợp khác: chỉ đóng modal
    if (status === "suitable") {
      onClose()
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[85vw] sm:w-[90vw] sm:max-w-none p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold">
                {candidate.hoVaTenDem} {candidate.ten} - {candidate.viTri}
              </SheetTitle>
              <div className="flex gap-4 mr-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadNewCVs}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Tải CV
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex h-[calc(100vh-80px)]">
            {/* Left Column - Extracted Information */}
            <div className="w-2/3 p-8 border-r">
              <ScrollArea className="h-full">
                <div className="space-y-6 pr-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{candidate.sdt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span>{candidate.gioiTinh}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>Năm sinh: {candidate.namSinh}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>Nguồn: {candidate.nguonHoSo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span>Khu vực: {candidate.khuVuc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span>Đơn vị: {candidate.donViUngTuyen}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                          <span>Hình thức: {candidate.hinhThuc}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Học vấn</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{candidate.truongDaoTao}</p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.chuyenNganh} • {candidate.namTotNghiep}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Hệ đào tạo:</span>
                          <p className="font-medium">{candidate.heDaoTao}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Loại tốt nghiệp:</span>
                          <p className="font-medium">{candidate.loaiTotNghiep}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Thạc sỹ:</span>
                          <p className="font-medium">{candidate.thacSy}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Đơn vị sàng lọc:</span>
                          <p className="font-medium">{candidate.donViSangLocHS}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Kinh nghiệm & Đánh giá</h3>
                    <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{candidate.kinhNghiemLamViec} năm kinh nghiệm</span>
                      </div>
                      {candidate.lyDoLoai && candidate.stage !== "bpcm-rejected" && (
                        <div className="p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm font-medium text-destructive">Lý do loại:</p>
                          <p className="text-sm text-destructive">{candidate.lyDoLoai}</p>
                        </div>
                      )}
                      {candidate.stage === "bpcm-rejected" && candidate.lyDoLoai && (
                        <div className="p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm font-medium text-orange-800">Lý do BPCM từ chối:</p>
                          <p className="text-sm text-orange-700">{candidate.lyDoLoai}</p>
                        </div>
                      )}
                      {candidate.activities?.find(activity => activity.action === "BPCM đồng ý ứng viên") && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800">Lý do BPCM đồng ý:</p>
                          <p className="text-sm text-green-700">
                            {candidate.activities.find(activity => activity.action === "BPCM đồng ý ứng viên")?.details?.reason || "BPCM đã đồng ý ứng viên"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Kỹ năng chính</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thông tin chi tiết</h3>
                    <div className="space-y-4 text-sm">
                      {/* Hàng 1: Thông tin cơ bản */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">STT</span>
                          <span className="font-medium">{candidate.stt}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Nguồn hồ sơ</span>
                          <span className="font-medium">{candidate.nguonHoSo}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Vị trí</span>
                          <span className="font-medium">{candidate.viTri}</span>
                        </div>
                      </div>
                      {/* Hàng 2: Thông tin cá nhân */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Họ tên đệm</span>
                          <span className="font-medium">{candidate.hoVaTenDem}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Tên</span>
                          <span className="font-medium">{candidate.ten}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Giới tính</span>
                          <span className="font-medium">{candidate.gioiTinh}</span>
                        </div>
                      </div>
                      {/* Hàng 3: Thông tin liên hệ */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Năm sinh</span>
                          <span className="font-medium">{candidate.namSinh}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">SĐT</span>
                          <span className="font-medium">{candidate.sdt}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Email</span>
                          <span className="font-medium break-all">{candidate.email}</span>
                        </div>
                      </div>
                      {/* Hàng 4: Học vấn */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Trường đào tạo</span>
                          <span className="font-medium">{candidate.truongDaoTao}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Hệ đào tạo</span>
                          <span className="font-medium">{candidate.heDaoTao}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Chuyên ngành</span>
                          <span className="font-medium">{candidate.chuyenNganh}</span>
                        </div>
                      </div>
                      {/* Hàng 5: Đơn vị ứng tuyển, Hình thức, Khu vực */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Đơn vị ứng tuyển</span>
                          <span className="font-medium">{candidate.donViUngTuyen}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Hình thức</span>
                          <span className="font-medium">{candidate.hinhThuc}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Khu vực</span>
                          <span className="font-medium">{candidate.khuVuc}</span>
                        </div>
                      </div>
                      {/* Hàng 6: Kinh nghiệm, Đơn vị sàng lọc */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Kinh nghiệm</span>
                          <span className="font-medium">{candidate.kinhNghiemLamViec} năm</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-muted-foreground text-xs">Đơn vị sàng lọc</span>
                          <span className="font-medium">{candidate.donViSangLocHS}</span>
                        </div>
                        <div></div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Button className="w-full gap-2 bg-transparent" variant="outline">
                      <Download className="h-4 w-4" />
                      Tải CV gốc (.pdf)
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Right Column - Evaluation & Activities */}
            <div className="w-1/3 p-8">
              <ScrollArea className="h-full">
                <div className="space-y-6 pr-4">
                  {/* Hành động - Di chuyển lên đầu */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Hành động</h3>
                      {candidate.emailSent && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Đã gửi email
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {/* Nút hành động theo giai đoạn */}
                      {(candidate.stage === "cv-new" || (candidate.stage === "screening" && candidate.status !== "suitable" && candidate.status !== "unsuitable")) && (
                        <>
                          <Button className="w-full gap-2" onClick={() => handleStatusUpdate("suitable")}>
                            <CheckCircle className="h-4 w-4" />
                            Phù hợp
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="destructive"
                            onClick={() => handleStatusUpdate("unsuitable")}
                          >
                            <XCircle className="h-4 w-4" />
                            Không phù hợp
                          </Button>
                        </>
                      )}

                      {/* BPCM actions in detail view */}
                      {candidate.stage === "bpcm-pending" && (onBPCMApprove || onBPCMReject) && (
                        <>
                          <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={onBPCMApprove}>
                            <UserCheck className="h-4 w-4" />
                            Đồng ý
                          </Button>
                          <Button className="w-full gap-2" variant="destructive" onClick={onBPCMReject}>
                            <UserX className="h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}

                      {candidate.stage === "screening" && candidate.status === "suitable" && (
                        <>
                          <Button className="w-full gap-2" onClick={() => handleEmailAction("interview", "interview-knowledge-test")}>
                            <UserCheck className="h-4 w-4" />
                            Mời tham gia vòng thi kỹ năng
                          </Button>
                          <Button className="w-full gap-2" onClick={() => handleEmailAction("interview", "interview-round-1")}>
                            <UserCheck className="h-4 w-4" />
                            Mời tham gia phỏng vấn vòng 1
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="destructive"
                            onClick={() => handleEmailAction("reject", "reject")}
                          >
                            <UserX className="h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}

                      {candidate.stage === "bpcm-approved" && (
                        <>
                          <Button className="w-full gap-2" onClick={() => handleEmailAction("interview", "interview-knowledge-test")}>
                            <UserCheck className="h-4 w-4" />
                            Mời làm bài thi kiến thức, kỹ năng
                          </Button>
                          <Button className="w-full gap-2" onClick={() => handleEmailAction("interview", "interview-round-1")}>
                            <UserCheck className="h-4 w-4" />
                            Mời phỏng vấn vòng 1
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="destructive"
                            onClick={() => handleEmailAction("reject", "reject")}
                          >
                            <UserX className="h-4 w-4" />
                            Gửi thư từ chối
                          </Button>
                        </>
                      )}

                      {candidate.stage === "knowledge-test" && (
                        <>
                          <Button className="w-full gap-2" onClick={() => handleEmailAction("interview", "interview-round-1")}>
                            <UserCheck className="h-4 w-4" />
                            Mời tham gia phỏng vấn vòng 1
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="destructive"
                            onClick={() => handleEmailAction("reject", "reject")}
                          >
                            <UserX className="h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}

                      {candidate.stage === "interview-1" && (
                        <>
                          <Button className="w-full gap-2" onClick={() => handleEmailAction("interview", "interview-round-2")}>
                            <UserCheck className="h-4 w-4" />
                            Mời tham gia phỏng vấn vòng 2
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="destructive"
                            onClick={() => handleEmailAction("reject", "reject")}
                          >
                            <UserX className="h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}

                      {candidate.stage === "interview-2" && (
                        <>
                          <Button className="w-full gap-2" onClick={() => handleEmailAction("offer", "offer-congratulations")}>
                            <UserCheck className="h-4 w-4" />
                            Gửi thư mời làm việc
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="destructive"
                            onClick={() => handleEmailAction("reject", "reject")}
                          >
                            <UserX className="h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}

                      {candidate.stage === "offer" && (
                        <>
                          <Button className="w-full gap-2" onClick={() => handleEmailAction("offer", "offer-congratulations")}>
                            <UserCheck className="h-4 w-4" />
                            {(candidate.emailStatusByStage && candidate.emailStatusByStage["offer-congratulations"]?.sent)
                              ? "Gửi lại thư mời làm việc"
                              : "Gửi thư mời làm việc"}
                          </Button>
                          <Button className="w-full gap-2" variant="outline" onClick={() => handleEmailAction("offer", "offer-health-check")}>
                            <UserCheck className="h-4 w-4" />
                            {(candidate.emailStatusByStage && candidate.emailStatusByStage["offer-health-check"]?.sent)
                              ? "Gửi lại hướng dẫn khám sức khỏe"
                              : "Gửi hướng dẫn khám sức khỏe"}
                          </Button>
                        </>
                      )}

                      {candidate.stage === "hired" && (
                        <Button className="w-full gap-2 bg-transparent" variant="outline">
                          <UserCheck className="h-4 w-4" />
                          Đã tuyển dụng
                        </Button>
                      )}

                      {candidate.stage === "rejected" && (
                        <div className="space-y-2">
                          <Button className="w-full gap-2 bg-transparent" variant="outline">
                            <UserX className="h-4 w-4" />
                            Đã từ chối
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="outline"
                            onClick={() => handleEmailAction("reject", "reject")}
                          >
                            <Mail className="h-4 w-4" />
                            {candidate.emailSent ? "Gửi lại email từ chối" : "Gửi email từ chối"}
                          </Button>
                        </div>
                      )}

                      {candidate.stage === "bpcm-rejected" && (
                        <div className="space-y-2">
                          <Button className="w-full gap-2 bg-transparent" variant="outline">
                            <UserX className="h-4 w-4" />
                            BPCM đã từ chối
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="outline"
                            onClick={() => handleEmailAction("reject", "reject")}
                          >
                            <Mail className="h-4 w-4" />
                            Gửi email từ chối
                          </Button>
                        </div>
                      )}

                      {/* Nút gửi lại email cho các giai đoạn cần email */}
                      {(candidate.stage === "knowledge-test" || candidate.stage === "interview-1" || candidate.stage === "interview-2") && (
                        <Button 
                          className="w-full gap-2" 
                          variant="outline"
                          onClick={() => {
                            const emailType = candidate.stage === "offer" ? "offer" : "interview"
                            const tpl =
                              candidate.stage === "knowledge-test" ? "interview-round-1" :
                              candidate.stage === "interview-1" ? "interview-round-2" :
                              undefined
                            handleEmailAction(emailType as any, tpl)
                          }}
                        >
                          <Mail className="h-4 w-4" />
                          {candidate.emailSent ? "Gửi lại email" : "Gửi email"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Kết quả sàng lọc</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Điểm tổng:</span>
                        {(() => {
                          const aiStatus = candidate.score >= 50 ? "suitable" : "unsuitable"
                          return <Badge className={getStatusColor(aiStatus)}>{candidate.score}/100</Badge>
                        })()}
                      </div>
                      <div className="space-y-2">
                        {screeningResults.map((result, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {result.passed ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className={result.passed ? "text-foreground" : "text-muted-foreground"}>
                              {result.criteria}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Lịch sử hoạt động</h3>
                    <div className="space-y-3">
                      {candidate.activities
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((activity) => (
                          <div key={activity.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: vi })} •{" "}
                                {activity.user}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Ghi chú</h3>
                    <Textarea
                      placeholder="Thêm ghi chú nội bộ..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={handleNotesBlur}
                      className="min-h-24"
                    />
                  </div>

                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Email Composition Modal */}
      <EmailCompositionModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSend={handleEmailSend}
        candidate={{
          id: candidate.id,
          name: `${candidate.hoVaTenDem} ${candidate.ten}`,
          email: candidate.email,
          position: candidate.viTri,
        }}
        emailType={emailType}
        templateType={templateType}
      />
    </>
  )
}
