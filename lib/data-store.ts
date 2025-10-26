"use client"

import { useCallback, useState } from "react"
import type { Activity, Candidate, FilterState } from "./types"

// Mock initial data với đầy đủ thông tin - ĐÃ DỌN DẸP BPCM
const initialCandidates: Candidate[] = [
  // CV mới - hiển thị ở trang 1
  {
    id: 5,
    stt: 1,
    nguonHoSo: "Website tuyển dụng",
    viTri: "UI/UX",
    hoVaTenDem: "Nguyễn Thị",
    ten: "Lan",
    gioiTinh: "Nữ",
    namSinh: 1992,
    sdt: "0987 654 321",
    email: "nguyenthilan@email.com",
    truongDaoTao: "Đại học Mỹ thuật",
    heDaoTao: "Chính quy",
    chuyenNganh: "Thiết kế đồ họa",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2016,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 6,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 78,
    status: "suitable-form1",
    stage: "cv-new",
    examBatchId: "batch-2",
    skills: ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"],
    notes: "Designer có kinh nghiệm tốt với UI/UX",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 11,
        candidateId: 5,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 57,
        candidateId: 5,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 78, criteria_passed: 3, criteria_failed: 2 },
      },
    ],
  },
  {
    id: 6,
    stt: 2,
    nguonHoSo: "Website tuyển dụng",
    viTri: "UI/UX",
    hoVaTenDem: "Trần Thị",
    ten: "Tuyết",
    gioiTinh: "Nữ",
    namSinh: 1994,
    sdt: "0741 852 963",
    email: "tranthituyet@email.com",
    truongDaoTao: "Đại học Mỹ thuật",
    heDaoTao: "Chính quy",
    chuyenNganh: "Thiết kế đồ họa",
    loaiTotNghiep: "Khá",
    namTotNghiep: 2018,
    thacSy: "Không",
    khuVuc: "Đà Nẵng",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 6,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 45,
    status: "unsuitable",
    stage: "cv-new",
    examBatchId: "batch-3",
    skills: ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"],
    notes: "Designer có kinh nghiệm tốt với UI/UX",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 12,
        candidateId: 6,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 58,
        candidateId: 6,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 45, criteria_passed: 2, criteria_failed: 3 },
      },
    ],
  },
  {
    id: 7,
    stt: 3,
    nguonHoSo: "LinkedIn",
    viTri: "Frontend Developer",
    hoVaTenDem: "Lê Văn",
    ten: "An",
    gioiTinh: "Nam",
    namSinh: 1990,
    sdt: "0123 456 789",
    email: "levanan@email.com",
    truongDaoTao: "Đại học Công nghệ Thông tin",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2014,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 8,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 85,
    status: "suitable-form1",
    stage: "cv-new",
    examBatchId: "batch-1",
    skills: ["React", "Vue.js", "TypeScript", "CSS", "JavaScript"],
    notes: "Ứng viên có kinh nghiệm frontend tốt",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 13,
        candidateId: 7,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 59,
        candidateId: 7,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 85, criteria_passed: 4, criteria_failed: 1 },
      },
    ],
      },
      {
        id: 8,
    stt: 4,
    nguonHoSo: "Website tuyển dụng",
    viTri: "Backend Developer",
    hoVaTenDem: "Phạm Thị",
    ten: "Hoa",
    gioiTinh: "Nữ",
    namSinh: 1989,
    sdt: "0912 345 678",
    email: "phamthihoa@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2013,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 10,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 92,
    status: "suitable-form1",
    stage: "cv-new",
    examBatchId: "batch-2",
    skills: ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
    notes: "Ứng viên senior với kinh nghiệm backend phong phú",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 14,
        candidateId: 8,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 60,
        candidateId: 8,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 92, criteria_passed: 5, criteria_failed: 0 },
      },
    ],
  },
  {
    id: 9,
    stt: 5,
    nguonHoSo: "LinkedIn",
    viTri: "Full-stack Developer",
    hoVaTenDem: "Nguyễn Văn",
    ten: "Dũng",
    gioiTinh: "Nam",
    namSinh: 1991,
    sdt: "0987 123 456",
    email: "nguyenvandung@email.com",
    truongDaoTao: "Đại học Công nghệ",
    heDaoTao: "Chính quy",
    chuyenNganh: "Khoa học máy tính",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2015,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 8,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 85,
    status: "suitable-form1",
    stage: "cv-new",
    examBatchId: "batch-3",
    skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
    notes: "Ứng viên full-stack với kỹ năng đa dạng",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 15,
        candidateId: 9,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 61,
        candidateId: 9,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 85, criteria_passed: 4, criteria_failed: 1 },
      },
    ],
  },
  {
    id: 10,
    stt: 6,
    nguonHoSo: "Website tuyển dụng",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Trần Thị",
    ten: "Mai",
    gioiTinh: "Nữ",
    namSinh: 1988,
    sdt: "0912 345 678",
    email: "tranthimai@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2012,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 12,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 90,
    status: "suitable-form1",
    stage: "cv-new",
    examBatchId: "batch-1",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins"],
    notes: "Ứng viên DevOps với kinh nghiệm cloud",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 16,
        candidateId: 10,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 62,
        candidateId: 10,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 90, criteria_passed: 5, criteria_failed: 0 },
      },
    ],
  },
  {
    id: 11,
    stt: 7,
    nguonHoSo: "LinkedIn",
    viTri: "Mobile Developer",
    hoVaTenDem: "Lê Văn",
    ten: "Hùng",
    gioiTinh: "Nam",
    namSinh: 1993,
    sdt: "0987 654 321",
    email: "levanhung@email.com",
    truongDaoTao: "Đại học Công nghệ Thông tin",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2017,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 6,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 87,
    status: "suitable-form1",
    stage: "cv-new",
    examBatchId: "batch-2",
    skills: ["React Native", "Flutter", "iOS", "Android", "JavaScript"],
    notes: "Ứng viên mobile với kinh nghiệm cross-platform",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 17,
        candidateId: 11,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 63,
        candidateId: 11,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 87, criteria_passed: 4, criteria_failed: 1 },
      },
    ],
  },
  {
    id: 12,
    stt: 8,
    nguonHoSo: "Website tuyển dụng",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Nguyễn Thị",
    ten: "Linh",
    gioiTinh: "Nữ",
    namSinh: 1990,
    sdt: "0912 345 678",
    email: "nguyenthilinh@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2014,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 9,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 91,
    status: "suitable-form1",
    stage: "cv-new",
    examBatchId: "batch-3",
    skills: ["Kubernetes", "Docker", "AWS", "Terraform", "Jenkins", "Prometheus"],
    notes: "Ứng viên có kinh nghiệm DevOps rất tốt, phù hợp với vị trí senior",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 18,
        candidateId: 12,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 64,
        candidateId: 12,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 91, criteria_passed: 5, criteria_failed: 0 },
      },
    ],
  },
  // Một số ứng viên đã pass test
  {
    id: 13,
    stt: 9,
    nguonHoSo: "Website tuyển dụng",
    viTri: "Backend Developer",
    hoVaTenDem: "Trần Văn",
    ten: "Nam",
    gioiTinh: "Nam",
    namSinh: 1987,
    sdt: "0912 345 678",
    email: "tranvannam@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2011,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 13,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 65,
    // Ensure exam-related stage uses H2
    status: "suitable-form2",
    stage: "pass-test",
    examBatchId: "batch-1",
    schedule: "Thi: 30/10/2025",
    skills: ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes", "PostgreSQL"],
    notes: "Senior Backend Developer với kinh nghiệm microservices",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 19,
        candidateId: 13,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 65,
        candidateId: 13,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 89, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 66,
        candidateId: 13,
        action: "Đã hoàn thành thi kiến thức",
        user: "Hệ thống",
        timestamp: "2025-09-30T10:00:00Z",
        details: { examScore: 85, result: "pass" },
      },
    ],
  },
  {
    id: 14,
    stt: 10,
    nguonHoSo: "LinkedIn",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Phạm Thị",
    ten: "Hương",
    gioiTinh: "Nữ",
    namSinh: 1989,
    sdt: "0912 345 678",
    email: "phamthihuong@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2013,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 11,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 66,
    status: "suitable-form2",
    stage: "fail-test",
    schedule: "Thi: 30/10/2025",
    skills: ["AWS", "Azure", "Terraform", "Jenkins", "GitLab CI/CD", "Kubernetes", "Docker"],
    notes: "Senior DevOps Engineer với kinh nghiệm cloud và automation",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 20,
        candidateId: 14,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
      {
        id: 67,
        candidateId: 14,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-29T12:35:00Z",
        details: { score: 92, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 68,
        candidateId: 14,
        action: "Đã hoàn thành thi kiến thức",
        user: "Hệ thống",
        timestamp: "2025-09-30T10:00:00Z",
        details: { examScore: 88, result: "pass" },
      },
    ],
  },
]

// Mock email activities
const initialEmailActivities: Activity[] = [
  {
    id: 1,
    candidateId: 5,
    action: "Gửi email mời phỏng vấn",
    user: "HR Manager",
    timestamp: "2025-09-29T14:00:00Z",
        details: {
      emailType: "interview",
      subject: "Mời tham gia phỏng vấn vị trí UI/UX Designer",
      sentAt: "2025-09-29T14:00:00Z"
    }
  },
  {
    id: 2,
    candidateId: 6,
    action: "Gửi email từ chối",
    user: "HR Manager", 
    timestamp: "2025-09-29T14:30:00Z",
    details: {
      emailType: "reject",
      subject: "Thông báo kết quả ứng tuyển",
      sentAt: "2025-09-29T14:30:00Z"
    }
  }
]

// Mock exam batches data
const initialExamBatches = [
  {
    id: "batch-1",
    name: "Đợt thi Chuyên môn IT - 25/10/2025",
    examDate: "2025-10-25",
    format: "online" as const,
    location: "Zoom Meeting",
    maxCandidates: 50,
    assignedCandidates: 12,
    status: "open" as const,
    createdAt: "2025-09-29T10:00:00Z",
    updatedAt: "2025-09-29T10:00:00Z",
    candidates: [
      {
        candidateId: 5,
        candidateName: "Nguyễn Thị Lan",
        candidateEmail: "nguyenthilan@email.com",
        assignedAt: "2025-09-29T10:00:00Z",
        examResult: "pass" as const,
        examScore: 85,
        notes: "Kết quả tốt"
      },
      {
        candidateId: 7,
        candidateName: "Lê Văn An",
        candidateEmail: "levanan@email.com",
        assignedAt: "2025-09-29T10:00:00Z",
        examResult: "pass" as const,
        examScore: 88,
        notes: "Xuất sắc"
      }
    ]
  },
  {
    id: "batch-2", 
    name: "Đợt thi Chuyên môn IT - 30/10/2025",
    examDate: "2025-10-30",
    format: "offline" as const,
    location: "Tòa nhà Mobifone - Tầng 15",
    maxCandidates: 30,
    assignedCandidates: 8,
    status: "open" as const,
    createdAt: "2025-09-29T11:00:00Z",
    updatedAt: "2025-09-29T11:00:00Z",
    candidates: []
  }
]

export function useHRData() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [emailActivities, setEmailActivities] = useState<Activity[]>(initialEmailActivities)
  const [examBatches, setExamBatches] = useState(initialExamBatches)
  const [filters, setFilters] = useState<FilterState>({
    position: "all",
    stage: "all",
    status: "all",
    search: "",
    examBatch: "all"
  })
  const [isLoading, setIsLoading] = useState(false)

  // Get all candidates (no filtering)
  const allCandidates = candidates

  // Filter candidates based on current filters
  const filteredCandidates = candidates.filter(candidate => {
    // Exam batch filter
    if (filters.examBatch !== "all") {
      if (candidate.examBatchId !== filters.examBatch) {
        return false
      }
    }
    // Position filter
    if (filters.position !== "all" && candidate.viTri !== filters.position) {
      return false
    }

    // Stage filter
    if (filters.stage !== "all" && candidate.stage !== filters.stage) {
      return false
    }

    // Status filter (AI result)
    if (filters.status !== "all") {
      const aiStatus = candidate.score < 30 ? "unsuitable" : 
                     candidate.score >= 30 && candidate.score < 70 ? "suitable-form2" : "suitable-form1"
      if (aiStatus !== filters.status) {
        return false
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        candidate.hoVaTenDem,
        candidate.ten,
        candidate.email,
        candidate.viTri,
        ...candidate.skills
      ].join(" ").toLowerCase()
      
      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    return true
  })

  // Update candidate stage
  const updateCandidateStage = useCallback((candidateId: number, newStage: string) => {
    setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
        ? { ...candidate, stage: newStage as any, updatedAt: new Date().toISOString() }
          : candidate
    ))
  }, [])

  // Update candidate interview result
  const updateCandidateInterviewResult = useCallback((candidateId: number, newResult: "pending" | "passed" | "rejected") => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, interviewResult: newResult, updatedAt: new Date().toISOString() }
        : candidate
    ))
  }, [])

  // Update candidate schedule
  const updateCandidateSchedule = useCallback((candidateId: number, schedule: string) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, schedule, updatedAt: new Date().toISOString() }
        : candidate
    ))
  }, [])

  // Update candidate exam batch id
  const updateCandidateExamBatch = useCallback((candidateId: number, examBatchId: string | undefined) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, examBatchId, updatedAt: new Date().toISOString() }
        : candidate
    ))
  }, [])

  // Update candidate notes
  const updateCandidateNotes = useCallback((candidateId: number, notes: string) => {
    setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, notes, updatedAt: new Date().toISOString() }
          : candidate
    ))
  }, [])

  // Update candidate status
  const updateCandidateStatus = useCallback((candidateId: number, status: string) => {
    setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
        ? { ...candidate, status: status as any, updatedAt: new Date().toISOString() }
          : candidate
    ))
  }, [])

  // Update candidate email status
  const updateCandidateEmailStatus = useCallback((candidateId: number, sent: boolean, lastSent?: string, stage?: string) => {
    setCandidates(prev => prev.map(candidate => {
        if (candidate.id === candidateId) {
        const emailStatusByStage = { ...candidate.emailStatusByStage }
        if (stage) {
          emailStatusByStage[stage] = { sent, lastSent }
        }
          return {
            ...candidate, 
          emailStatusByStage,
          emailSent: sent,
          lastEmailSent: lastSent,
            updatedAt: new Date().toISOString() 
          }
        }
        return candidate
    }))
  }, [])

  // Update candidate BPCM reviews (legacy - will be removed)
  const updateCandidateBPCMReviews = useCallback((candidateId: number, reviews: any[]) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, bpcmReviews: reviews, updatedAt: new Date().toISOString() }
        : candidate
    ))
  }, [])

  // Get email status for a specific stage
  const getEmailStatusForStage = useCallback((candidateId: number, stage: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return { sent: false, lastSent: undefined }
    
    return candidate.emailStatusByStage?.[stage] || { sent: false, lastSent: undefined }
  }, [candidates])

  // Add email activity
  const addEmailActivity = useCallback((candidateId: number, type: string, details?: any) => {
    const newActivity: Activity = {
      id: Date.now(),
      candidateId,
      action: `Gửi email ${type}`,
      user: "HR Manager",
      timestamp: new Date().toISOString(),
      details
    }

    setEmailActivities(prev => [newActivity, ...prev])
  }, [])

  // Sync CVs from email (mock)
  const syncCVsFromEmail = useCallback(async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock new CVs
    const newCVs = [
      // H2 Candidate 1
      {
        id: 15,
        stt: 11,
        nguonHoSo: "Email",
        viTri: "Backend Developer",
        hoVaTenDem: "Trần Thị",
        ten: "Linh",
        gioiTinh: "Nữ" as "Nam" | "Nữ",
        namSinh: 1995,
        sdt: "0987 123 456",
        email: "tranthilinh@email.com",
        truongDaoTao: "Đại học Bách Khoa",
        heDaoTao: "Chính quy",
        chuyenNganh: "Khoa học máy tính",
        loaiTotNghiep: "Khá",
        namTotNghiep: 2018,
        thacSy: "Không",
        khuVuc: "Hà Nội",
        donViUngTuyen: "CNTT",
        hinhThuc: "Toàn thời gian",
        kinhNghiemLamViec: 4,
        lyDoLoai: "",
        donViSangLocHS: "HR Team",
        score: 45, // H2 range (30-69)
        status: "suitable-form2" as "suitable-form1" | "suitable" | "unsuitable" | "suitable-form2",
        stage: "cv-new" as "cv-new" | "screening" | "bpcm-pending" | "bpcm-approved" | "bpcm-rejected" | "knowledge-test" | "interview-1" | "interview-2" | "offer" | "hired" | "rejected" | "waiting-exam-schedule" | "scheduled-exam" | "pass-test" | "fail-test",
        examBatchId: "batch-1",
        skills: ["Java", "Spring Boot", "MySQL", "Docker"],
        notes: "CV mới từ email - Cần thi kỹ năng",
        emailSent: false,
        lastEmailSent: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: 100,
            candidateId: 15,
            action: "CV được đồng bộ từ email",
            user: "Hệ thống",
            timestamp: new Date().toISOString(),
          }
        ]
      },
      // H2 Candidate 2
      {
        id: 16,
        stt: 12,
        nguonHoSo: "Email",
        viTri: "DevOps Engineer",
        hoVaTenDem: "Lê Văn",
        ten: "Hùng",
        gioiTinh: "Nam" as "Nam" | "Nữ",
        namSinh: 1992,
        sdt: "0987 123 457",
        email: "levanhung@email.com",
        truongDaoTao: "Đại học Công nghệ",
        heDaoTao: "Chính quy",
        chuyenNganh: "Công nghệ thông tin",
        loaiTotNghiep: "Khá",
        namTotNghiep: 2016,
        thacSy: "Không",
        khuVuc: "TP.HCM",
        donViUngTuyen: "CNTT",
        hinhThuc: "Toàn thời gian",
        kinhNghiemLamViec: 5,
        lyDoLoai: "",
        donViSangLocHS: "HR Team",
        score: 55, // H2 range (30-69)
        status: "suitable-form2" as "suitable-form1" | "suitable" | "unsuitable" | "suitable-form2",
        stage: "cv-new" as "cv-new" | "screening" | "bpcm-pending" | "bpcm-approved" | "bpcm-rejected" | "knowledge-test" | "interview-1" | "interview-2" | "offer" | "hired" | "rejected" | "waiting-exam-schedule" | "scheduled-exam" | "pass-test" | "fail-test",
        examBatchId: "batch-2",
        skills: ["AWS", "Kubernetes", "Jenkins", "Linux"],
        notes: "CV mới từ email - Cần thi kỹ năng",
        emailSent: false,
        lastEmailSent: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: 101,
            candidateId: 16,
            action: "CV được đồng bộ từ email",
            user: "Hệ thống",
            timestamp: new Date().toISOString(),
          }
        ]
      },
      // Unsuitable Candidate 1
      {
        id: 17,
        stt: 13,
        nguonHoSo: "Email",
        viTri: "Data Analyst",
        hoVaTenDem: "Phạm Thị",
        ten: "Mai",
        gioiTinh: "Nữ" as "Nam" | "Nữ",
        namSinh: 1998,
        sdt: "0987 123 458",
        email: "phamthimai@email.com",
        truongDaoTao: "Đại học Kinh tế",
        heDaoTao: "Chính quy",
        chuyenNganh: "Kế toán",
        loaiTotNghiep: "Trung bình",
        namTotNghiep: 2020,
        thacSy: "Không",
        khuVuc: "Đà Nẵng",
        donViUngTuyen: "CNTT",
        hinhThuc: "Toàn thời gian",
        kinhNghiemLamViec: 1,
        lyDoLoai: "",
        donViSangLocHS: "HR Team",
        score: 15, // Unsuitable range (<30)
        status: "unsuitable" as "suitable-form1" | "suitable" | "unsuitable" | "suitable-form2",
        stage: "cv-new" as "cv-new" | "screening" | "bpcm-pending" | "bpcm-approved" | "bpcm-rejected" | "knowledge-test" | "interview-1" | "interview-2" | "offer" | "hired" | "rejected" | "waiting-exam-schedule" | "scheduled-exam" | "pass-test" | "fail-test",
        examBatchId: "batch-2",
        skills: ["Excel", "Word", "PowerPoint"],
        notes: "CV mới từ email - Không phù hợp",
        emailSent: false,
        lastEmailSent: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: 102,
            candidateId: 17,
            action: "CV được đồng bộ từ email",
            user: "Hệ thống",
            timestamp: new Date().toISOString(),
          }
        ]
      },
      // Unsuitable Candidate 2
      {
        id: 18,
        stt: 14,
        nguonHoSo: "Email",
        viTri: "UI/UX Designer",
        hoVaTenDem: "Hoàng Văn",
        ten: "Nam",
        gioiTinh: "Nam" as "Nam" | "Nữ",
        namSinh: 1996,
        sdt: "0987 123 459",
        email: "hoangvannam@email.com",
        truongDaoTao: "Cao đẳng Nghề",
        heDaoTao: "Tại chức",
        chuyenNganh: "Thiết kế đồ họa",
        loaiTotNghiep: "Trung bình",
        namTotNghiep: 2019,
        thacSy: "Không",
        khuVuc: "Cần Thơ",
        donViUngTuyen: "CNTT",
        hinhThuc: "Toàn thời gian",
        kinhNghiemLamViec: 2,
        lyDoLoai: "",
        donViSangLocHS: "HR Team",
        score: 25, // Unsuitable range (<30)
        status: "unsuitable" as "suitable-form1" | "suitable" | "unsuitable" | "suitable-form2",
        stage: "cv-new" as "cv-new" | "screening" | "bpcm-pending" | "bpcm-approved" | "bpcm-rejected" | "knowledge-test" | "interview-1" | "interview-2" | "offer" | "hired" | "rejected" | "waiting-exam-schedule" | "scheduled-exam" | "pass-test" | "fail-test",
        examBatchId: "batch-3",
        skills: ["Photoshop", "Illustrator", "Canva"],
        notes: "CV mới từ email - Không phù hợp",
        emailSent: false,
        lastEmailSent: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: 103,
            candidateId: 18,
            action: "CV được đồng bộ từ email",
            user: "Hệ thống",
            timestamp: new Date().toISOString(),
          }
        ]
      }
    ]
    
    setCandidates(prev => [...newCVs, ...prev])
    setIsLoading(false)

    return { newCVs: newCVs.length }
  }, [])

  // Get stage statistics
  const getStageStats = useCallback(() => {
    const stats: Record<string, number> = {}

    candidates.forEach(candidate => {
      const stage = candidate.stage
      stats[stage] = (stats[stage] || 0) + 1
    })

    return stats
  }, [candidates])


  return {
    candidates: filteredCandidates,
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
    setExamBatches
  }
}
