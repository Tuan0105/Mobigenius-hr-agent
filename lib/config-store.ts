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
  type: "interview" | "interview-knowledge-test" | "interview-round-1" | "interview-round-2" | "offer" | "offer-congratulations" | "offer-health-check" | "reject" | "confirmation"
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
  "UI/UX",
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
  // 4: UI/UX
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
    name: "Thư mời tham dự vòng thi kiến thức, kỹ năng",
    type: "interview-knowledge-test",
    subject: "Thư mời tham dự vòng thi kiến thức, kỹ năng - Vị trí {{ViTriUngTuyen}}",
    content: `Thân gửi {{TenUngVien}}!

Chúc mừng bạn đã vượt qua vòng sàng lọc hồ sơ và được mời tham gia vòng thi kiến thức, kỹ năng cho vị trí {{ViTriUngTuyen}} tại Tổng Công ty Viễn thông MobiFone.

Thông tin thi kiến thức, kỹ năng:
- Thời gian dự kiến: {{ThoiGianPhongVan}}
- Địa điểm: Trung tâm Công nghệ thông tin MobiFone, Tầng 10, tòa nhà Thái Nam, 22D đường Dương Đình Nghệ, Cầu Giấy, Hà Nội
- Hình thức: Thi trực tiếp tại văn phòng
- Thời gian dự kiến: 90 phút
- Nội dung thi: Kiến thức chuyên môn và kỹ năng thực hành

Vui lòng có mặt đúng giờ và xác nhận tham gia thi bằng cách trả lời email này trước {{NgayXacNhan}} để chúng tôi có thể chuẩn bị tốt nhất.

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
    name: "Thư mời tham dự phỏng vấn",
    type: "interview-round-1",
    subject: "Thư mời tham dự phỏng vấn - Vị trí {{ViTriUngTuyen}}",
    content: `Thân gửi {{TenUngVien}}!

Chúc mừng bạn đã vượt qua vòng thi kiến thức, kỹ năng và được mời tham gia phỏng vấn cho vị trí {{ViTriUngTuyen}} tại Tổng Công ty Viễn thông MobiFone.

Thông tin phỏng vấn:
- Thời gian dự kiến: {{ThoiGianPhongVan}}
- Địa điểm: Trung tâm Công nghệ thông tin MobiFone, Tầng 10, tòa nhà Thái Nam, 22D đường Dương Đình Nghệ, Cầu Giấy, Hà Nội
- Hình thức: Phỏng vấn trực tiếp
- Thời gian dự kiến: 60 phút

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
    id: 3,
    name: "Thư mời tham dự phỏng vấn vòng 2",
    type: "interview-round-2",
    subject: "Thư mời tham dự phỏng vấn vòng 2 - Vị trí {{ViTriUngTuyen}}",
    content: `Thân gửi {{TenUngVien}}!

Chúc mừng bạn đã vượt qua vòng phỏng vấn đầu tiên và được mời tham gia phỏng vấn vòng 2 cho vị trí {{ViTriUngTuyen}} tại Tổng Công ty Viễn thông MobiFone.

Thông tin phỏng vấn vòng 2:
- Thời gian dự kiến: {{ThoiGianPhongVan}}
- Địa điểm: Trung tâm Công nghệ thông tin MobiFone, Tầng 10, tòa nhà Thái Nam, 22D đường Dương Đình Nghệ, Cầu Giấy, Hà Nội
- Hình thức: Phỏng vấn trực tiếp
- Thời gian dự kiến: 90 phút
- Nội dung: Phỏng vấn chuyên sâu về kỹ năng và kinh nghiệm

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
    id: 4,
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
    id: 5,
    name: "Thư chúc mừng trúng tuyển và hướng dẫn bổ sung hồ sơ nhân sự",
    type: "offer-congratulations",
    subject: "Thư chúc mừng trúng tuyển và hướng dẫn bổ sung hồ sơ nhân sự - Vị trí {{ViTriUngTuyen}}",
    content: `Thân gửi {{TenUngVien}}!

Chúc mừng bạn đã vượt qua tất cả các vòng tuyển dụng và được chọn làm nhân sự chính thức cho vị trí {{ViTriUngTuyen}} tại Trung tâm Công nghệ thông tin MobiFone.

Thông tin công việc:
- Vị trí: {{ViTriUngTuyen}}
- Địa điểm làm việc: Phòng Big Data, Trung tâm CNTT MobiFone, Tầng 10, Thái Nam Building, 22D Dương Đình Nghệ, Yên Hoà, Cầu Giấy
- Khung lương sau thử việc: Chuyên viên Khung E – bậc 1

Để hoàn tất thủ tục nhận việc, bạn vui lòng chuẩn bị và nộp hồ sơ bổ sung theo danh mục sau:

1. Đơn dự tuyển (Đơn xin việc)
2. Bản sao Giấy khai sinh
3. Bản sao có công chứng CMTND/CCCD
4. Bản sao có công chứng: Bằng tốt nghiệp Đại học, Bảng điểm Đại học, Chứng chỉ ngoại ngữ (trình độ B1 trở lên)
5. Sơ yếu lý lịch có xác nhận của cơ quan có thẩm quyền (không quá 03 tháng tính đến ngày nộp hồ sơ)
6. Bản sao công chứng Sổ hộ khẩu/Đăng ký tạm trú hoặc Bản sao/chụp hệ thống quản lý cư dân điện tử
7. Giấy chứng nhận khám sức khoẻ mẫu A3 (không quá 03 tháng tính đến ngày nộp hồ sơ)
8. 03 ảnh 4x6 mới nhất

Thông tin nộp hồ sơ:
- Người liên hệ: Cô Hương - 0906073906
- Địa chỉ: Phòng Tổng hợp, Trung tâm CNTT MobiFone, tòa nhà Thái Nam, đường Dương Đình Nghệ, phường Yên Hòa, quận Cầu Giấy, Hà Nội
- Hạn nộp: Trước ngày {{NgayNopHoSo}}

Chúc bạn sức khỏe và thành công!

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
    id: 6,
    name: "Hướng dẫn thủ tục khám sức khỏe tuyển dụng đầu vào",
    type: "offer-health-check",
    subject: "Hướng dẫn thủ tục khám sức khỏe tuyển dụng đầu vào - MobiFone IT",
    content: `Thân gửi {{TenUngVien}}!

Chúc mừng bạn đã trở thành Chuyên viên Chính thức của Trung tâm Công nghệ thông tin MobiFone. Chúng tôi đánh giá cao chuyên môn, năng lực và kinh nghiệm làm việc của bạn.

Để hoàn tất thủ tục nhận việc, bạn vui lòng thực hiện khám sức khỏe theo hướng dẫn sau:

HƯỚNG DẪN KHÁM SỨC KHỎE:
- Địa chỉ khám: Bệnh viện Bưu Điện – 49 Trần Điền, Định Công, Hà Nội
- Gói khám: 584.000 đồng
- Vật dụng cần mang: 01 ảnh thẻ 4x6 và Căn cước công dân
- Thời gian khám: Giờ hành chính từ Thứ 2 đến Thứ 6

Quy trình khám:
1. Tại Quầy tiếp đón, đăng ký gói khám sức khỏe tuyển dụng của MobiFone
2. Làm theo hướng dẫn của bệnh viện
3. Tự thanh toán chi phí khám sức khỏe
4. Mang đầy đủ hóa đơn chứng từ về để Trung tâm hoàn trả phí khám

Hồ sơ cần mang về nộp lại Trung tâm:
1. Toàn bộ hồ sơ khám sức khỏe bản gốc (bao gồm phiếu xét nghiệm, phim chụp X quang...)
2. Giấy khám sức khỏe (có đóng dấu)
3. Hóa đơn + Bảng kê chi phí (có đóng dấu)

THÔNG TIN XUẤT HÓA ĐƠN:
- Họ tên người mua hàng: {{TenUngVien}}
- Tên đơn vị: TRUNG TÂM CÔNG NGHỆ THÔNG TIN MOBIFONE - CHI NHÁNH TỔNG CÔNG TY VIỄN THÔNG MOBIFONE
- Mã số thuế: 0100686209-166
- Địa chỉ: số 01 phố Phạm Văn Bạch, Phường Yên Hoà, Quận Cầu Giấy, Thành Phố Hà Nội, Việt Nam

Lưu ý: Vui lòng xuất hóa đơn chính xác thông tin trên (trường hợp hóa đơn sai thông tin sẽ không thể thanh toán chi phí khám).

Chúc bạn sức khỏe và thành công!

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
    id: 7,
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

  const addEmailTemplate = useCallback((templateData: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">) => {
    const newTemplate: EmailTemplate = {
      ...templateData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setEmailTemplates((prev) => [...prev, newTemplate])
  }, [])

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
    addEmailTemplate,
    updateEmailTemplate,
  }
}
