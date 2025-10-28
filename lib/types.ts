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
  score: number // Điểm AI sàng lọc
  examScore?: number // Điểm thi kỹ năng (nếu có)
  status: "suitable" | "unsuitable" | "suitable-form1" | "suitable-form2"
  stage: "cv-new" | "screening" | "bpcm-pending" | "bpcm-approved" | "bpcm-rejected" | "knowledge-test" | "interview-1" | "interview-2" | "offer" | "hired" | "rejected" | "waiting-exam-schedule" | "scheduled-exam" | "pass-test" | "fail-test"
  interviewResult?: "pending" | "passed" | "rejected"
  schedule?: string // Lịch trình: "Thi: 25/10/2025", "PV V1: 26/10/2025", "PV V2: 28/10/2025"
  examBatchId?: string // id của đợt thi đã gán (nếu có)
  skills: string[]
  notes: string
  emailSent: boolean
  lastEmailSent?: string
  emailStatusByStage?: Record<string, { sent: boolean; lastSent?: string }>
  createdAt: string
  updatedAt: string
  activities: Activity[]
  // BPCM Multi-department support
  bpcmReviews?: BPCMReview[]
}

export interface BPCMReview {
  id: string
  departmentId: string
  departmentName: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewer?: string
  reason?: string
  note?: string
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
  examBatch: string // id của đợt thi để lọc, "all" nếu không lọc
}

export interface ExamBatch {
  id: string
  name: string
  examDate: string
  format: "online" | "offline"
  location?: string
  maxCandidates: number
  assignedCandidates: number
  status: "open" | "completed" | "graded"
  createdAt: string
  updatedAt: string
  candidates?: ExamBatchCandidate[]
}

export interface ExamBatchCandidate {
  candidateId: number
  candidateName: string
  candidateEmail: string
  assignedAt: string
  examResult?: "pass" | "fail"
  examScore?: number
  notes?: string
}
