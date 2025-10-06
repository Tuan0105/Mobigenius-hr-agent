"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Send, X } from "lucide-react"
import { useEffect, useState } from "react"

interface EmailCompositionModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (emailData: EmailData) => void
  candidate: {
    id: number
    name: string
    email: string
    position: string
  }
  emailType: "interview" | "offer" | "reject"
}

interface EmailData {
  to: string
  subject: string
  content: string
  interviewDate?: Date
  interviewTime?: string
  candidateId?: number
  emailType?: string
}

const emailTemplates = {
  interview: {
    subject: "Thư mời phỏng vấn - Vị trí {{ViTriUngTuyen}} tại MobifoneIT",
    content: `Chào {{TenUngVien}},

Chúng tôi rất vui mừng thông báo rằng hồ sơ của bạn cho vị trí {{ViTriUngTuyen}} đã được chọn để tham gia vòng phỏng vấn.

Thông tin phỏng vấn:
- Thời gian: {{ThoiGianPhongVan}}
- Địa điểm: Văn phòng MobifoneIT, Tầng 10, Tòa nhà ABC, 123 Đường XYZ, Hà Nội
- Hình thức: Phỏng vấn trực tiếp
- Thời gian dự kiến: 60 phút

Vui lòng xác nhận tham gia phỏng vấn bằng cách trả lời email này trước ngày {{NgayXacNhan}}.

Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email này hoặc số điện thoại: 024 1234 5678.

Chúng tôi rất mong được gặp bạn!

Trân trọng,
Đội ngũ Tuyển dụng
MobifoneIT`,
  },
  offer: {
    subject: "Thư chào mừng - Chúc mừng bạn đã trúng tuyển vị trí {{ViTriUngTuyen}}",
    content: `Chào {{TenUngVien}},

Chúc mừng! Chúng tôi rất vui mừng thông báo rằng bạn đã được chọn cho vị trí {{ViTriUngTuyen}} tại MobifoneIT.

Thông tin công việc:
- Vị trí: {{ViTriUngTuyen}}
- Mức lương: Thỏa thuận (sẽ được thảo luận chi tiết)
- Ngày bắt đầu làm việc: {{NgayBatDau}}
- Địa điểm làm việc: Văn phòng MobifoneIT, Tầng 10, Tòa nhà ABC

Quyền lợi:
- Lương tháng 13, thưởng theo hiệu suất
- Bảo hiểm sức khỏe cao cấp
- Môi trường làm việc hiện đại, năng động
- Cơ hội phát triển nghề nghiệp

Vui lòng xác nhận việc nhận offer này trong vòng 7 ngày làm việc kể từ ngày nhận email.

Chúng tôi rất mong chờ được chào đón bạn vào đội ngũ MobifoneIT!

Trân trọng,
Đội ngũ Tuyển dụng
MobifoneIT`,
  },
  reject: {
    subject: "Thông báo kết quả ứng tuyển - Vị trí {{ViTriUngTuyen}}",
    content: `Chào {{TenUngVien}},

Cảm ơn bạn đã quan tâm và ứng tuyển vào vị trí {{ViTriUngTuyen}} tại MobifoneIT.

Sau khi xem xét kỹ lưỡng hồ sơ của bạn, chúng tôi rất tiếc phải thông báo rằng lần này chúng tôi sẽ không thể tiếp tục với ứng viên của bạn cho vị trí này.

Quyết định này không phản ánh năng lực của bạn mà chỉ đơn giản là do chúng tôi đã tìm được ứng viên phù hợp hơn với yêu cầu cụ thể của vị trí.

Chúng tôi sẽ lưu giữ hồ sơ của bạn và sẽ liên hệ nếu có cơ hội phù hợp khác trong tương lai.

Chúc bạn sớm tìm được công việc phù hợp và thành công trong sự nghiệp!

Trân trọng,
Đội ngũ Tuyển dụng
MobifoneIT`,
  },
}

export function EmailCompositionModal({ isOpen, onClose, onSend, candidate, emailType }: EmailCompositionModalProps) {
  const { toast } = useToast()
  const [emailData, setEmailData] = useState<EmailData>({
    to: candidate.email,
    subject: "",
    content: "",
  })
  const [interviewDate, setInterviewDate] = useState<Date>()
  const [interviewTime, setInterviewTime] = useState("")
  const [confirmDate, setConfirmDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  // Controlled popovers to avoid focus/portal conflicts inside Dialog
  // Fallback inline pickers (avoid Popover focus/portal issues inside Dialog)
  const [showInterviewPicker, setShowInterviewPicker] = useState(false)
  const [showConfirmPicker, setShowConfirmPicker] = useState(false)

  // Inject custom CSS for calendar styling with high specificity for modal
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Ultra high specificity for modal calendar */
      [data-radix-portal] .custom-calendar .rdp-day_today,
      [data-radix-portal] .custom-calendar [data-rdp-day-today],
      [data-radix-portal] .custom-calendar .rdp-day[data-rdp-day-today],
      .custom-calendar .rdp-day_today,
      .custom-calendar [data-rdp-day-today],
      .custom-calendar .rdp-day[data-rdp-day-today] {
        background-color: white !important;
        color: #1f2937 !important;
        border: 2px solid #000000 !important;
        font-weight: 600 !important;
      }
      [data-radix-portal] .custom-calendar .rdp-day_today:hover,
      [data-radix-portal] .custom-calendar [data-rdp-day-today]:hover,
      [data-radix-portal] .custom-calendar .rdp-day[data-rdp-day-today]:hover,
      .custom-calendar .rdp-day_today:hover,
      .custom-calendar [data-rdp-day-today]:hover,
      .custom-calendar .rdp-day[data-rdp-day-today]:hover {
        background-color: #f3f4f6 !important;
        border-color: #000000 !important;
        color: #111827 !important;
      }
      [data-radix-portal] .custom-calendar .rdp-day_selected,
      [data-radix-portal] .custom-calendar [data-rdp-day-selected],
      [data-radix-portal] .custom-calendar .rdp-day[data-rdp-day-selected],
      .custom-calendar .rdp-day_selected,
      .custom-calendar [data-rdp-day-selected],
      .custom-calendar .rdp-day[data-rdp-day-selected] {
        background-color: #3b82f6 !important;
        color: white !important;
        border: 2px solid #3b82f6 !important;
        font-weight: 600 !important;
      }
      [data-radix-portal] .custom-calendar .rdp-day_selected:hover,
      [data-radix-portal] .custom-calendar [data-rdp-day-selected]:hover,
      [data-radix-portal] .custom-calendar .rdp-day[data-rdp-day-selected]:hover,
      .custom-calendar .rdp-day_selected:hover,
      .custom-calendar [data-rdp-day-selected]:hover,
      .custom-calendar .rdp-day[data-rdp-day-selected]:hover {
        background-color: #2563eb !important;
        border-color: #2563eb !important;
      }
      /* Force override for any calendar day in modal */
      [data-radix-portal] .custom-calendar .rdp-day[data-rdp-day-today]:not([data-rdp-day-selected]),
      .custom-calendar .rdp-day[data-rdp-day-today]:not([data-rdp-day-selected]) {
        background-color: white !important;
        color: #1f2937 !important;
        border: 2px solid #000000 !important;
        font-weight: 600 !important;
      }
      /* Additional modal-specific overrides */
      [data-radix-dialog-content] .custom-calendar .rdp-day_today,
      [data-radix-dialog-content] .custom-calendar [data-rdp-day-today] {
        background-color: white !important;
        color: #1f2937 !important;
        border: 2px solid #000000 !important;
        font-weight: 600 !important;
      }
      /* Custom today style class */
      .custom-today-style {
        background-color: white !important;
        color: #1f2937 !important;
        border: 2px solid #000000 !important;
        font-weight: 600 !important;
      }
      .custom-today-style:hover {
        background-color: #f3f4f6 !important;
        border-color: #000000 !important;
        color: #111827 !important;
      }
    `
    document.head.appendChild(style)
    
    // Also apply styles after a delay to ensure modal is rendered
    const timeoutId = setTimeout(() => {
      const todayElements = document.querySelectorAll('.custom-calendar [data-rdp-day-today]')
      todayElements.forEach((element: any) => {
        if (element && !element.hasAttribute('data-rdp-day-selected')) {
          element.style.backgroundColor = 'white'
          element.style.color = '#1f2937'
          element.style.border = '2px solid #6b7280'
          element.style.fontWeight = '600'
        }
      })
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Apply calendar styles when pickers are opened
  useEffect(() => {
    if (showInterviewPicker || showConfirmPicker) {
      const applyStyles = () => {
        // Find all today elements with multiple selectors
        const selectors = [
          '.custom-calendar [data-rdp-day-today]',
          '.custom-calendar .rdp-day_today',
          '.custom-calendar .rdp-day[data-rdp-day-today]',
          '[data-radix-portal] .custom-calendar [data-rdp-day-today]',
          '[data-radix-dialog-content] .custom-calendar [data-rdp-day-today]'
        ]
        
        let foundElements = 0
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach((element: any) => {
            if (element && !element.hasAttribute('data-rdp-day-selected')) {
              foundElements++
              console.log('Applying custom today styles to:', element)
              
              // Force override with multiple methods
              element.style.cssText = `
                background-color: white !important;
                color: #1f2937 !important;
                border: 2px solid #000000 !important;
                font-weight: 600 !important;
              `
              
              // Also set individual properties
              element.style.setProperty('background-color', 'white', 'important')
              element.style.setProperty('color', '#1f2937', 'important')
              element.style.setProperty('border', '2px solid #000000', 'important')
              element.style.setProperty('font-weight', '600', 'important')
              
              // Add custom class for additional specificity
              element.classList.add('custom-today-style')
            }
          })
        })
        
        if (foundElements > 0) {
          console.log(`Applied custom today styles to ${foundElements} elements`)
        }
      }

      // Apply immediately
      applyStyles()
      
      // Apply using requestAnimationFrame for better timing
      const rafId = requestAnimationFrame(() => {
        applyStyles()
        requestAnimationFrame(applyStyles)
      })
      
      // Apply multiple times with different delays
      const timeouts = [
        setTimeout(applyStyles, 10),
        setTimeout(applyStyles, 50),
        setTimeout(applyStyles, 100),
        setTimeout(applyStyles, 200)
      ]
      
      // Use MutationObserver to watch for calendar changes
      const observer = new MutationObserver(() => {
        applyStyles()
      })
      
      const calendarContainer = document.querySelector('.custom-calendar')
      if (calendarContainer) {
        observer.observe(calendarContainer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-rdp-day-today', 'data-rdp-day-selected']
        })
      }
      
      return () => {
        cancelAnimationFrame(rafId)
        timeouts.forEach(clearTimeout)
        observer.disconnect()
      }
    }
  }, [showInterviewPicker, showConfirmPicker])

  // Initialize email template based on type
  useEffect(() => {
    if (isOpen) {
      // Tự động set ngày xác nhận = ngày hiện tại + 5 ngày
      const today = new Date()
      const confirmDate = new Date(today)
      confirmDate.setDate(confirmDate.getDate() + 5)
      setConfirmDate(confirmDate)
      
      console.log('Setting confirm date to:', confirmDate.toISOString().split('T')[0])
      
      const template = emailTemplates[emailType]
      const processedSubject = template.subject
        .replace("{{TenUngVien}}", candidate.name)
        .replace("{{ViTriUngTuyen}}", candidate.position)

      const processedContent = template.content
        .replace(/{{TenUngVien}}/g, candidate.name)
        .replace(/{{ViTriUngTuyen}}/g, candidate.position)

      setEmailData({
        to: candidate.email,
        subject: processedSubject,
        content: processedContent,
      })

      // Reset interview fields
      setInterviewDate(undefined)
      setInterviewTime("")
      // Không reset confirmDate vì đã set ở trên
    }
  }, [isOpen, emailType, candidate])

  // Đảm bảo confirmDate được set mỗi lần modal mở
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const confirmDate = new Date(today)
      confirmDate.setDate(confirmDate.getDate() + 5)
      setConfirmDate(confirmDate)
      console.log('Auto-setting confirm date to:', confirmDate.toISOString().split('T')[0])
    }
  }, [isOpen])

  // Update content when interview date/time / confirm date changes
  useEffect(() => {
    if (emailType === "interview" && interviewDate && interviewTime) {
      const formattedDateTime = `${format(interviewDate, "EEEE, dd/MM/yyyy", { locale: vi })} lúc ${interviewTime}`

      const derivedConfirmDate = confirmDate
        ? confirmDate
        : new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000)
      const confirmDateText = format(derivedConfirmDate, "dd/MM/yyyy", { locale: vi })

      setEmailData((prev) => ({
        ...prev,
        content: prev.content
          .replace("{{ThoiGianPhongVan}}", formattedDateTime)
          .replace("{{NgayXacNhan}}", confirmDateText),
        interviewDate,
        interviewTime,
      }))
    }
  }, [interviewDate, interviewTime, confirmDate, emailType])

  const handleSend = async () => {
    if (emailType === "interview" && (!interviewDate || !interviewTime)) {
      alert("Vui lòng chọn thời gian phỏng vấn")
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSend({
        ...emailData,
        candidateId: candidate.id,
        emailType,
        interviewDate,
        interviewTime,
      })
      
      // Hiển thị toast notification thành công
      const getEmailTypeText = () => {
        switch (emailType) {
          case "interview":
            return "Tham gia phỏng vấn vòng kỹ năng"
          case "offer":
            return "Thư mời làm việc"
          case "reject":
            return "Thông báo từ chối"
          default:
            return "Email"
        }
      }
      
      toast({
        title: "Gửi email thành công!",
        description: `Gửi email "${getEmailTypeText()}" thành công tới ${candidate.name}`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      })
      
      onClose()
    } catch (error) {
      console.error("Error sending email:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getModalTitle = () => {
    switch (emailType) {
      case "interview":
        return "Gửi Email Mời Phỏng Vấn"
      case "offer":
        return "Gửi Email Chào Mừng"
      case "reject":
        return "Gửi Email Từ Chối"
      default:
        return "Soạn Email"
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[90vw] sm:w-[95vw] sm:max-w-none p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
          <SheetTitle className="text-xl font-semibold">
            {getModalTitle()}: {candidate.name}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 min-h-0">
          {/* Left Column - Email Composition */}
          <div className="w-1/2 p-6 border-r overflow-y-auto">
            <div className="space-y-6">
          {/* Email Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">Người nhận</Label>
              <Input
                id="email-to"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                className="bg-muted"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject">Tiêu đề</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Nhập tiêu đề email..."
              />
            </div>
          </div>

          {/* Interview Date/Time Selection (only for interview emails) */}
          {emailType === "interview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label>Chọn ngày phỏng vấn</Label>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !interviewDate && "text-muted-foreground",
                  )}
                  onClick={() => setShowInterviewPicker((v) => !v)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {interviewDate ? format(interviewDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                </Button>
                {showInterviewPicker && (
                  <div className="mt-2 border rounded-md bg-card p-2">
                    <Calendar
                      mode="single"
                      selected={interviewDate}
                      onSelect={(d) => {
                        setInterviewDate(d)
                        setShowInterviewPicker(false)
                        // Không tự động set ngày xác nhận từ ngày phỏng vấn
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="custom-calendar"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Chọn giờ phỏng vấn</Label>
                <Select value={interviewTime} onValueChange={setInterviewTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="08:30">08:30</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="09:30">09:30</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="10:30">10:30</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="13:30">13:30</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="14:30">14:30</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="15:30">15:30</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                    <SelectItem value="16:30">16:30</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Ngày hạn xác nhận tham gia</Label>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !confirmDate && "text-muted-foreground",
                  )}
                  onClick={() => setShowConfirmPicker((v) => !v)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {confirmDate
                    ? format(confirmDate, "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày xác nhận"}
                  
              
                </Button>
                {showConfirmPicker && (
                  <div className="mt-2 border rounded-md bg-card p-2">
                    <Calendar
                      mode="single"
                      selected={confirmDate}
                      onSelect={(d) => {
                        setConfirmDate(d)
                        setShowConfirmPicker(false)
                      }}
                      disabled={(date) => {
                        // Không giới hạn ngày xác nhận - cho phép chọn bất kỳ ngày nào
                        return false
                      }}
                      initialFocus
                      className="custom-calendar"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Mặc định sẽ là 5 ngày sau ngày hiện tại. Bạn có thể chọn ngày khác tự do.
                </p>
              </div>
            </div>
          )}

          {/* Email Content */}
          <div className="space-y-2">
            <Label htmlFor="email-content">Nội dung email</Label>
            <Textarea
              id="email-content"
              value={emailData.content}
              onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
              className="min-h-96 font-mono text-sm"
              placeholder="Nhập nội dung email..."
            />
          </div>

            </div>
          </div>

          {/* Right Column - Email Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Xem trước Email</h3>
              <div className="border rounded-lg bg-white shadow-sm">
                <div className="p-4 border-b bg-muted/30">
                  <div className="text-sm text-muted-foreground">Từ: hr@mobifone.vn</div>
                  <div className="text-sm text-muted-foreground">Đến: {emailData.to}</div>
                  <div className="font-medium">{emailData.subject}</div>
                </div>
                <div className="p-4 max-h-96 overflow-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{emailData.content}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-background flex-shrink-0">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button onClick={handleSend} disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? "Đang gửi..." : "Gửi Email"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
