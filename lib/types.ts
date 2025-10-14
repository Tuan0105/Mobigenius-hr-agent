export interface Candidate {
  id: number
  stt: number
  nguonHoSo: string
  viTri: string
  hoVaTenDem: string
  ten: string
  gioiTinh: "Nam" | "Nữ"
  namSinh: number
  sdt: string
  email: string
  truongDaoTao: string
  heDaoTao: string
  chuyenNganh: string
  loaiTotNghiep: string
  namTotNghiep: number
  thacSy: string
  khuVuc: string
  donViUngTuyen: string
  hinhThuc: string
  kinhNghiemLamViec: number
  lyDoLoai: string
  donViSangLocHS: string
  score: number
  status: "suitable" | "unsuitable"
  stage: "cv-new" | "screening" | "knowledge-test" | "interview-1" | "interview-2" | "offer" | "hired" | "rejected"
  skills: string[]
  notes: string
  emailSent: boolean
  lastEmailSent?: string
  emailStatusByStage?: Record<string, { sent: boolean; lastSent?: string }>
  createdAt: string
  updatedAt: string
  activities: Activity[]
}

export interface Activity {
  id: number
  candidateId: number
  action: string
  user: string
  timestamp: string
  details?: Record<string, any>
}

export interface Stage {
  id: string
  title: string
  count: number
}

export interface EmailTemplate {
  id: number
  name: string
  type: "interview" | "offer" | "reject" | "confirmation"
  subject: string
  content: string
}

export interface Position {
  id: number
  name: string
  status: "active" | "paused"
  applications: number
}

export interface ScreeningCriteria {
  id: number
  positionId: number
  name: string
  value: string
  type: "hard" | "custom"
  enabled: boolean
}

export interface FilterState {
  position: string
  stage: string
  status: string
  search: string
}
