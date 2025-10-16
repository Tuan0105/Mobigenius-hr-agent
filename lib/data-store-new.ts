"use client"

import { useCallback, useState } from "react"
import type { Activity, Candidate, FilterState } from "./types"

// Mock initial data với đầy đủ thông tin
const initialCandidates: Candidate[] = [
  {
    id: 1,
    stt: 1,
    nguonHoSo: "Website tuyển dụng",
    viTri: "Frontend Developer",
    hoVaTenDem: "Nguyễn Văn",
    ten: "An",
    gioiTinh: "Nam",
    namSinh: 1995,
    sdt: "0123 456 789",
    email: "nguyenvanan@email.com",
    truongDaoTao: "Đại học Bách Khoa Hà Nội",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2020,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "MobiGenius",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 4,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 85,
    status: "suitable",
    stage: "cv-new",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB"],
    notes: "Ứng viên có kinh nghiệm tốt với React và Next.js",
    createdAt: "2025-09-28T10:00:00Z",
    updatedAt: "2025-09-29T14:30:00Z",
    activities: [
      {
        id: 1,
        candidateId: 1,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-28T10:00:00Z",
      },
      {
        id: 2,
        candidateId: 1,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-28T10:05:00Z",
        details: { score: 85, criteria_passed: 4, criteria_failed: 1 },
      },
    ],
    emailSent: false
  },
  {
    id: 2,
    stt: 2,
    nguonHoSo: "LinkedIn",
    viTri: "Backend Developer",
    hoVaTenDem: "Trần Thị",
    ten: "Bình",
    gioiTinh: "Nữ",
    namSinh: 1993,
    sdt: "0987 654 321",
    email: "tranthibinh@email.com",
    truongDaoTao: "Đại học Công nghệ",
    heDaoTao: "Chính quy",
    chuyenNganh: "Khoa học máy tính",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2019,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "MobiGenius",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 5,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 92,
    status: "suitable",
    stage: "knowledge-test",
    skills: ["Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
    notes: "Ứng viên xuất sắc với kinh nghiệm backend mạnh",
    createdAt: "2025-09-27T15:30:00Z",
    updatedAt: "2025-09-29T09:15:00Z",
    activities: [
      {
        id: 3,
        candidateId: 2,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-27T15:30:00Z",
      },
      {
        id: 4,
        candidateId: 2,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-27T15:35:00Z",
        details: { score: 92, criteria_passed: 5, criteria_failed: 0 },
      },
    ],
    emailSent: false
  },
  {
    id: 3,
    stt: 3,
    nguonHoSo: "Website công ty",
    viTri: "AI Engineer",
    hoVaTenDem: "Phạm Thị",
    ten: "Dung",
    gioiTinh: "Nữ",
    namSinh: 1997,
    sdt: "0369 258 147",
    email: "phamthidung@email.com",
    truongDaoTao: "Đại học FPT",
    heDaoTao: "Chính quy",
    chuyenNganh: "Phần mềm",
    loaiTotNghiep: "Khá",
    namTotNghiep: 2021,
    thacSy: "Không",
    khuVuc: "Đà Nẵng",
    donViUngTuyen: "MobiGenius",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 3,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 88,
    status: "suitable",
    stage: "cv-new",
    skills: ["Vue.js", "Laravel", "MySQL", "Redis", "Git"],
    notes: "Ứng viên trẻ có tiềm năng phát triển tốt",
    createdAt: "2025-09-26T14:20:00Z",
    updatedAt: "2025-09-29T11:00:00Z",
    activities: [
      {
        id: 5,
        candidateId: 3,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-26T14:20:00Z",
      },
      {
        id: 6,
        candidateId: 3,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-26T14:25:00Z",
        details: { score: 88, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 7,
        candidateId: 3,
        action: "Chuyển sang giai đoạn phỏng vấn",
        user: "HR Manager",
        timestamp: "2025-09-29T11:00:00Z",
      },
    ],
    emailSent: false
  },
  {
    id: 4,
    stt: 4,
    nguonHoSo: "Referral",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Hoàng Văn",
    ten: "Em",
    gioiTinh: "Nam",
    namSinh: 1990,
    sdt: "0582 741 963",
    email: "hoangvanem@email.com",
    truongDaoTao: "Đại học Khoa học Tự nhiên",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2015,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "MobiGenius",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 8,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 95,
    status: "suitable",
    stage: "hired",
    skills: ["Kubernetes", "Terraform", "Jenkins", "Prometheus", "Grafana"],
    notes: "Chuyên gia DevOps với kinh nghiệm dày dặn",
    createdAt: "2025-09-25T08:45:00Z",
    updatedAt: "2025-09-29T16:20:00Z",
    activities: [
      {
        id: 8,
        candidateId: 4,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-25T08:45:00Z",
      },
      {
        id: 9,
        candidateId: 4,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-25T08:50:00Z",
        details: { score: 95, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 10,
        candidateId: 4,
        action: "Gửi thư chúc mừng trúng tuyển",
        user: "HR Manager",
        timestamp: "2025-09-29T16:20:00Z",
      },
    ],
    emailSent: false
  },
  {
    id: 5,
    stt: 5,
    nguonHoSo: "Website tuyển dụng",
    viTri: "UI/UX Designer",
    hoVaTenDem: "Lê Thị",
    ten: "Giang",
    gioiTinh: "Nữ",
    namSinh: 1994,
    sdt: "0741 852 963",
    email: "lethigiang@email.com",
    truongDaoTao: "Đại học Mỹ thuật",
    heDaoTao: "Chính quy",
    chuyenNganh: "Thiết kế đồ họa",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2018,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "MobiGenius",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 6,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 78,
    status: "suitable",
    stage: "cv-new",
    skills: ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"],
    notes: "Designer có kinh nghiệm tốt với UI/UX",
    createdAt: "2025-09-29T12:30:00Z",
    updatedAt: "2025-09-29T12:30:00Z",
    activities: [
      {
        id: 11,
        candidateId: 5,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-29T12:30:00Z",
      },
    ],
    emailSent: false
  },
]

export function useHRData() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [filters, setFilters] = useState<FilterState>({
    position: "all",
    stage: "all",
    status: "all",
    search: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Get all candidates (for reference)
  const allCandidates = candidates

  // Filter candidates based on current filters
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesPosition = filters.position === "all" || candidate.viTri.toLowerCase().includes(filters.position.toLowerCase())
    const matchesStage = filters.stage === "all" || candidate.stage === filters.stage
    // AI result derived from score: >=50 suitable, else unsuitable
    const derivedAIStatus = candidate.score >= 50 ? "suitable" : "unsuitable"
    const matchesStatus = filters.status === "all" || derivedAIStatus === filters.status
    const matchesSearch = filters.search === "" || 
      candidate.hoVaTenDem.toLowerCase().includes(filters.search.toLowerCase()) ||
      candidate.ten.toLowerCase().includes(filters.search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      candidate.sdt.includes(filters.search) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))

    return matchesPosition && matchesStage && matchesStatus && matchesSearch
  })

  // Update candidate stage
  const updateCandidateStage = useCallback((candidateId: number, newStage: Candidate["stage"]) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, stage: newStage, updatedAt: new Date().toISOString() }
          : candidate
      )
    )
  }, [])

  // Update candidate notes
  const updateCandidateNotes = useCallback((candidateId: number, notes: string) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, notes, updatedAt: new Date().toISOString() }
          : candidate
      )
    )
  }, [])

  // Add email activity
  const addEmailActivity = useCallback((candidateId: number, type: string, details?: Record<string, any>) => {
    const newActivity: Activity = {
      id: Date.now(),
      candidateId,
      action: `Email ${type} đã được gửi`,
      user: "HR Team",
      timestamp: new Date().toISOString(),
      details
    }

    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { 
              ...candidate, 
              activities: [...candidate.activities, newActivity],
              updatedAt: new Date().toISOString()
            }
          : candidate
      )
    )
  }, [])

  // Sync CVs from email (mock function)
  const syncCVsFromEmail = useCallback(async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock new CVs
    const newCandidates: Candidate[] = [
      {
        id: Date.now() + 1,
        stt: candidates.length + 1,
        nguonHoSo: "Email",
        viTri: "VHKT",
        hoVaTenDem: "Nguyễn Thị",
        ten: "Hoa",
        gioiTinh: "Nữ",
        namSinh: 1996,
        sdt: "0912 345 678",
        email: "nguyenthihoa@email.com",
        truongDaoTao: "Đại học Kinh tế",
        heDaoTao: "Chính quy",
        chuyenNganh: "Quản trị kinh doanh",
        loaiTotNghiep: "Khá",
        namTotNghiep: 2020,
        thacSy: "Không",
        khuVuc: "Hà Nội",
        donViUngTuyen: "MobiGenius",
        hinhThuc: "Toàn thời gian",
        kinhNghiemLamViec: 3,
        lyDoLoai: "",
        donViSangLocHS: "HR Team",
        score: 0,
        status: "unsuitable",
        stage: "cv-new",
        skills: ["HTML", "CSS", "JavaScript", "React"],
        notes: "CV mới từ email",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: Date.now(),
            candidateId: Date.now() + 1,
            action: "CV được đồng bộ từ email",
            user: "Hệ thống",
            timestamp: new Date().toISOString(),
          }
        ],
        emailSent: false
      }
    ]

    setCandidates(prev => [...prev, ...newCandidates])
    setIsLoading(false)

    return { newCVs: newCandidates.length }
  }, [candidates.length])

  // Get stage statistics
  const getStageStats = useCallback(() => {
    const stats = {
      "cv-new": 0,
      "screening": 0,
      "interview": 0,
      "knowledge-test": 0,
      "interview-1": 0,
      "interview-2": 0,
      "bpcm-pending": 0,
      "bpcm-rejected": 0,
      "bpcm-approved": 0,
      "offer": 0,
      "hired": 0,
      "rejected": 0,
    }

    candidates.forEach(candidate => {
      stats[candidate.stage] = (stats[candidate.stage] || 0) + 1
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
    updateCandidateNotes,
    addEmailActivity,
    syncCVsFromEmail,
    getStageStats,
  }
}
