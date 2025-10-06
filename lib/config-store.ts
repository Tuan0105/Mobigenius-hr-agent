"use client"

import { useCallback, useState } from "react"

export interface Position {
  id: number
  name: string
  status: "active" | "paused"
  applications: number
  createdAt: string
  updatedAt: string
}

export interface ScreeningCriteria {
  id: number
  positionId: number
  name: string
  value: string
  type: "hard" | "custom"
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface EmailTemplate {
  id: number
  name: string
  type: "interview" | "offer" | "reject" | "confirmation"
  subject: string
  content: string
  createdAt: string
  updatedAt: string
}

// Shared positions list
export const POSITION_NAMES = [
  "ATTT",
  "DEV",
  "DEV Mobile",
  "UI UX",
  "PO",
  "AI Engineer",
  "BA",
  "Vận hành, khai thác",
  "Tester",
  "Data Engineer",
  "Trải nghiệm khách hàng",
] as const

// Mock initial data derived from shared list
const initialPositions: Position[] = POSITION_NAMES.map((name, idx) => ({
  id: idx + 1,
  name,
  status: "active",
  applications: Math.floor(Math.random() * 20),
  createdAt: "2025-09-01T00:00:00Z",
  updatedAt: "2025-09-29T00:00:00Z",
}))

const initialCriteria: ScreeningCriteria[] = [
  // 0: Global (applies to all positions)
  { id: 1, positionId: 0, name: "Bằng cấp", value: "Tốt nghiệp CNTT hoặc liên quan", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 2, positionId: 0, name: "Xếp loại tốt nghiệp", value: ">= Khá", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 3, positionId: 0, name: "Kỹ năng tin học văn phòng", value: "Bắt buộc", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 1: ATTT
  { id: 101, positionId: 1, name: "Chứng chỉ bảo mật", value: "CEH/OSCP ưu tiên", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 102, positionId: 1, name: "Kinh nghiệm bảo mật", value: ">= 2 năm", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 2: DEV
  { id: 201, positionId: 2, name: "Ngôn ngữ chính", value: "TypeScript/Java", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 202, positionId: 2, name: "Framework", value: "React/Next.js hoặc Spring", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 203, positionId: 2, name: "Kinh nghiệm", value: ">= 2 năm", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 3: DEV Mobile
  { id: 301, positionId: 3, name: "Nền tảng", value: "Flutter/React Native", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 302, positionId: 3, name: "Phát hành", value: "Đã phát hành app thực tế", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 4: UI UX
  { id: 401, positionId: 4, name: "Công cụ", value: "Figma/XD/Sketch", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 402, positionId: 4, name: "Portfolio", value: "Bắt buộc", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 5: PO
  { id: 501, positionId: 5, name: "Kinh nghiệm PO/PM", value: ">= 2 năm", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 502, positionId: 5, name: "Chứng chỉ Agile", value: "CSM/PSPO ưu tiên", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 6: AI Engineer
  { id: 601, positionId: 6, name: "Ngôn ngữ", value: "Python bắt buộc", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 602, positionId: 6, name: "Kinh nghiệm ML", value: "Pytorch/TensorFlow", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 7: BA
  { id: 701, positionId: 7, name: "Kỹ năng phân tích", value: "Bắt buộc", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 702, positionId: 7, name: "Tài liệu", value: "User story, BRD", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 8: Vận hành, khai thác
  { id: 801, positionId: 8, name: "Hệ điều hành", value: "Linux/Unix", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 802, positionId: 8, name: "Giám sát hệ thống", value: "Zabbix/Prometheus", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 9: Tester
  { id: 901, positionId: 9, name: "Kiểm thử tự động", value: "Selenium/Playwright ưu tiên", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 902, positionId: 9, name: "Kinh nghiệm testing", value: ">= 1 năm", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 10: Data Engineer
  { id: 1001, positionId: 10, name: "SQL nâng cao", value: "Bắt buộc", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 1002, positionId: 10, name: "ETL/Streaming", value: "Airflow/Kafka ưu tiên", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  // 11: Trải nghiệm khách hàng
  { id: 1101, positionId: 11, name: "Giao tiếp", value: "Rất tốt", type: "hard", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
  { id: 1102, positionId: 11, name: "Kinh nghiệm CS", value: ">= 1 năm", type: "custom", enabled: true, createdAt: "2025-09-01T00:00:00Z", updatedAt: "2025-09-29T00:00:00Z" },
]

const initialEmailTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: "Thư mời phỏng vấn",
    type: "interview",
    subject: "Thư mời phỏng vấn - Vị trí {{ViTriUngTuyen}}",
    content: `Thân gửi {{TenUngVien}}!

Chúc mừng bạn đã vượt qua vòng sàng lọc hồ sơ và được mời tham gia phỏng vấn cho vị trí {{ViTriUngTuyen}} tại Tổng Công ty Viễn thông MobiFone.

Thông tin phỏng vấn:
- Thời gian dự kiến: {{ThoiGianPhongVan}}
- Địa điểm: Trung tâm Công nghệ thông tin MobiFone, Tầng 10, tòa nhà Thái Nam, 22D đường Dương Đình Nghệ, Cầu Giấy, Hà Nội
- Hình thức: Phỏng vấn trực tiếp

Vui lòng có mặt đúng giờ và xác nhận tham gia phỏng vấn bằng cách trả lời email này trước {{NgayXacNhan}} để chúng tôi có thể chuẩn bị tốt nhất.

Chúc bạn sức khỏe và thành công trong sự nghiệp!

Trân trọng,
Bộ phận tuyển dụng
Trung tâm Công nghệ thông tin MobiFone
Website: it.mobifone.vn/tuyen-dung
Facebook: www.facebook.com/MobifoneIT
Mọi thắc mắc liên hệ: 0906.073.906`,
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2025-09-29T00:00:00Z",
  },
  {
    id: 2,
    name: "Thư từ chối",
    type: "reject",
    subject: "Thông báo kết quả ứng tuyển - Vị trí {{ViTriUngTuyen}}",
    content: `Thân gửi {{TenUngVien}},

Cảm ơn bạn đã quan tâm và ứng tuyển vào vị trí {{ViTriUngTuyen}} tại Tổng Công ty Viễn thông MobiFone.

Sau khi xem xét kỹ lưỡng hồ sơ của bạn, chúng tôi rất tiếc phải thông báo rằng lần này chúng tôi sẽ không thể tiếp tục với ứng viên của bạn cho vị trí này.

Quyết định này không phản ánh năng lực của bạn mà chỉ đơn giản là do chúng tôi đã tìm được ứng viên phù hợp hơn với yêu cầu cụ thể của vị trí.

Chúng tôi sẽ lưu giữ hồ sơ của bạn và sẽ liên hệ nếu có cơ hội phù hợp khác trong tương lai.

Chúc bạn sớm tìm được công việc phù hợp và thành công trong sự nghiệp!

Trân trọng,
Bộ phận tuyển dụng
Trung tâm Công nghệ thông tin MobiFone
Website: it.mobifone.vn/tuyen-dung
Facebook: www.facebook.com/MobifoneIT
Mọi thắc mắc liên hệ: 0906.073.906`,
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2025-09-29T00:00:00Z",
  },
  {
    id: 3,
    name: "Thư gửi offer",
    type: "offer",
    subject: "Thư chào mừng - Chúc mừng bạn đã trúng tuyển vị trí {{ViTriUngTuyen}}",
    content: `Thân gửi {{TenUngVien}},

Chúc mừng! Chúng tôi rất vui mừng thông báo rằng bạn đã được chọn cho vị trí {{ViTriUngTuyen}} tại Tổng Công ty Viễn thông MobiFone.

Thông tin công việc:
- Vị trí: {{ViTriUngTuyen}}
- Mức lương: Thỏa thuận (sẽ được thảo luận chi tiết)
- Ngày bắt đầu làm việc: {{NgayBatDau}}
- Địa điểm làm việc: Trung tâm Công nghệ thông tin MobiFone, Tầng 10, tòa nhà Thái Nam, 22D đường Dương Đình Nghệ, Cầu Giấy, Hà Nội

Quyền lợi:
- Lương tháng 13, thưởng theo hiệu suất
- Bảo hiểm sức khỏe cao cấp
- Môi trường làm việc hiện đại, năng động
- Cơ hội phát triển nghề nghiệp

Vui lòng xác nhận việc nhận offer này trong vòng 7 ngày làm việc kể từ ngày nhận email.

Chúng tôi rất mong chờ được chào đón bạn vào đội ngũ MobiFone!

Trân trọng,
Bộ phận tuyển dụng
Trung tâm Công nghệ thông tin MobiFone
Website: it.mobifone.vn/tuyen-dung
Facebook: www.facebook.com/MobifoneIT
Mọi thắc mắc liên hệ: 0906.073.906`,
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2025-09-29T00:00:00Z",
  },
  {
    id: 4,
    name: "Thư xác nhận nhận việc",
    type: "confirmation",
    subject: "Xác nhận nhận việc - Chào mừng bạn đến với MobiFone",
    content: `Thân gửi {{TenUngVien}},

Chúng tôi rất vui mừng xác nhận rằng bạn đã chính thức trở thành thành viên của đội ngũ Tổng Công ty Viễn thông MobiFone!

Thông tin onboarding:
- Ngày bắt đầu: {{NgayBatDau}}
- Thời gian: 9:00 AM
- Địa điểm: Trung tâm Công nghệ thông tin MobiFone, Tầng 10, tòa nhà Thái Nam, 22D đường Dương Đình Nghệ, Cầu Giấy, Hà Nội
- Liên hệ: Bộ phận HR - 0906.073.906

Vui lòng chuẩn bị:
- Giấy tờ tùy thân (CMND/CCCD)
- Bằng cấp và chứng chỉ liên quan
- Hợp đồng lao động đã ký

Chúng tôi rất mong chờ được làm việc cùng bạn!

Trân trọng,
Bộ phận tuyển dụng
Trung tâm Công nghệ thông tin MobiFone
Website: it.mobifone.vn/tuyen-dung
Facebook: www.facebook.com/MobifoneIT
Mọi thắc mắc liên hệ: 0906.073.906`,
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2025-09-29T00:00:00Z",
  },
]

export function useConfigData() {
  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const [criteria, setCriteria] = useState<ScreeningCriteria[]>(initialCriteria)
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(initialEmailTemplates)
  const [isLoading, setIsLoading] = useState(false)

  // Position management
  const addPosition = useCallback((positionData: Omit<Position, "id" | "applications" | "createdAt" | "updatedAt">) => {
    const newPosition: Position = {
      ...positionData,
      id: Date.now(),
      applications: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPositions((prev) => [...prev, newPosition])
  }, [])

  const updatePosition = useCallback((id: number, updates: Partial<Position>) => {
    setPositions((prev) =>
      prev.map((pos) => (pos.id === id ? { ...pos, ...updates, updatedAt: new Date().toISOString() } : pos)),
    )
  }, [])

  const deletePosition = useCallback((id: number) => {
    setPositions((prev) => prev.filter((pos) => pos.id !== id))
    setCriteria((prev) => prev.filter((crit) => crit.positionId !== id))
  }, [])

  // Criteria management
  const getCriteriaByPosition = useCallback(
    (positionId: number) => {
      return criteria.filter((crit) => crit.positionId === positionId)
    },
    [criteria],
  )

  const getCommonCriteria = useCallback(() => {
    return criteria.filter((crit) => crit.positionId === 0)
  }, [criteria])

  const addCriteria = useCallback((criteriaData: Omit<ScreeningCriteria, "id" | "createdAt" | "updatedAt">) => {
    const newCriteria: ScreeningCriteria = {
      ...criteriaData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCriteria((prev) => [...prev, newCriteria])
  }, [])

  const updateCriteria = useCallback((id: number, updates: Partial<ScreeningCriteria>) => {
    setCriteria((prev) =>
      prev.map((crit) => (crit.id === id ? { ...crit, ...updates, updatedAt: new Date().toISOString() } : crit)),
    )
  }, [])

  const deleteCriteria = useCallback((id: number) => {
    setCriteria((prev) => prev.filter((crit) => crit.id !== id))
  }, [])

  // Email template management
  const getTemplateByType = useCallback(
    (type: EmailTemplate["type"]) => {
      return emailTemplates.find((template) => template.type === type)
    },
    [emailTemplates],
  )

  const updateEmailTemplate = useCallback((id: number, updates: Partial<EmailTemplate>) => {
    setEmailTemplates((prev) =>
      prev.map((template) =>
        template.id === id ? { ...template, ...updates, updatedAt: new Date().toISOString() } : template,
      ),
    )
  }, [])

  return {
    // Data
    positions,
    criteria,
    emailTemplates,
    isLoading,

    // Position methods
    addPosition,
    updatePosition,
    deletePosition,

    // Criteria methods
    getCriteriaByPosition,
    getCommonCriteria,
    addCriteria,
    updateCriteria,
    deleteCriteria,

    // Email template methods
    getTemplateByType,
    updateEmailTemplate,
  }
}
