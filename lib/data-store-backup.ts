"use client"

import { useCallback, useState } from "react"
import type { Activity, Candidate, FilterState } from "./types"

// Mock initial data với đầy đủ thông tin
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
    status: "suitable",
    stage: "cv-new",
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
    score: 65,
    status: "suitable-form2",
    stage: "cv-new",
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
    nguonHoSo: "Website tuyển dụng",
    viTri: "Frontend Developer",
    hoVaTenDem: "Lê Văn",
    ten: "Minh",
    gioiTinh: "Nam",
    namSinh: 1992,
    sdt: "0987 654 321",
    email: "levanminh@email.com",
    truongDaoTao: "Đại học Công nghệ",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2016,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 7,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 78,
    status: "suitable",
    stage: "cv-new",
    skills: ["React", "Vue.js", "JavaScript", "CSS", "HTML"],
    notes: "Ứng viên có kinh nghiệm frontend tốt",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 64,
        candidateId: 7,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T09:00:00Z",
      },
      {
        id: 65,
        candidateId: 7,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T09:05:00Z",
        details: { score: 65, criteria_passed: 2, criteria_failed: 3 },
      },
    ],
  },
  // CV cũ - hiển thị sau
  {
    id: 1,
    stt: 4,
    nguonHoSo: "Website tuyển dụng",
    viTri: "DEV",
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
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 4,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 85,
    status: "suitable",
    stage: "knowledge-test",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB"],
    notes: "Ứng viên có kinh nghiệm tốt với React và Next.js",
    emailSent: true,
    lastEmailSent: "2025-09-29T10:00:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-09-29T10:00:00Z" }
    },
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
      {
        id: 3,
        candidateId: 1,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-28T10:15:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 4,
        candidateId: 1,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-28T14:30:00Z",
        details: { 
          reason: "Ứng viên có kinh nghiệm tốt với React và Next.js, phù hợp với yêu cầu dự án.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
  },
  {
    id: 2,
    stt: 5,
    nguonHoSo: "LinkedIn",
    viTri: "AI Engineer",
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
    donViUngTuyen: "MDS",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 5,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 92,
    status: "suitable",
    stage: "interview-1",
    skills: ["Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
    notes: "Ứng viên xuất sắc với kinh nghiệm backend mạnh",
    emailSent: true,
    lastEmailSent: "2025-09-29T09:15:00Z",
    emailStatusByStage: {
      "interview-1": { sent: true, lastSent: "2025-09-29T09:15:00Z" }
    },
    createdAt: "2025-09-27T15:30:00Z",
    updatedAt: "2025-09-29T09:15:00Z",
    activities: [
      {
        id: 5,
        candidateId: 2,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-27T15:30:00Z",
      },
      {
        id: 6,
        candidateId: 2,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-27T15:35:00Z",
        details: { score: 92, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 7,
        candidateId: 2,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-27T15:45:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 8,
        candidateId: 2,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-27T16:20:00Z",
        details: { 
          reason: "Ứng viên có điểm số cao, kinh nghiệm phong phú với Node.js và MongoDB. Rất phù hợp với vị trí.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    // BPCM Reviews - Multiple departments with mixed results
    bpcmReviews: [
      {
        id: "2-dev1-1704067200000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "approved",
        submittedAt: "2025-09-27T15:45:00Z",
        reviewedAt: "2025-09-27T16:20:00Z",
        reviewer: "Trưởng phòng DEV1",
        reason: "Ứng viên có kinh nghiệm Node.js và Python tốt, phù hợp với team",
        note: "Có thể bắt đầu ngay"
      },
      {
        id: "2-bigdata-1704067200000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "approved",
        submittedAt: "2025-09-27T15:45:00Z",
        reviewedAt: "2025-09-27T16:30:00Z",
        reviewer: "Trưởng phòng Big Data",
        reason: "Kinh nghiệm AWS và Docker rất tốt cho dự án Big Data",
        note: "Cần training thêm về Spark"
      },
      {
        id: "2-iot-1704067200000",
        departmentId: "iot",
        departmentName: "BU IOT",
        status: "pending",
        submittedAt: "2025-09-27T15:45:00Z"
      }
    ],
  },
  {
    id: 3,
    stt: 6,
    nguonHoSo: "Website công ty",
    viTri: "UI/UX",
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
    donViUngTuyen: "NOC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 3,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 88,
    status: "suitable",
    stage: "hired",
    skills: ["Vue.js", "Laravel", "MySQL", "Redis", "Git"],
    notes: "Ứng viên trẻ có tiềm năng phát triển tốt",
    emailSent: true,
    lastEmailSent: "2025-09-29T11:00:00Z",
    emailStatusByStage: {
      "offer-congratulations": { sent: true, lastSent: "2025-09-29T11:00:00Z" }
    },
    createdAt: "2025-09-26T14:20:00Z",
    updatedAt: "2025-09-29T11:00:00Z",
    activities: [
      {
        id: 9,
        candidateId: 3,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-26T14:20:00Z",
      },
      {
        id: 10,
        candidateId: 3,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-26T14:25:00Z",
        details: { score: 88, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 11,
        candidateId: 3,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-26T14:35:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 12,
        candidateId: 3,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-26T16:00:00Z",
        details: { 
          reason: "Ứng viên có kinh nghiệm tốt với Python và Django, phù hợp với yêu cầu backend.",
          department: "Phòng Công nghệ thông tin"
        },
      },
      {
        id: 13,
        candidateId: 3,
        action: "Gửi thư chúc mừng trúng tuyển",
        user: "HR Manager",
        timestamp: "2025-09-29T11:00:00Z",
      },
    ],
    // BPCM Reviews - All approved
    bpcmReviews: [
      {
        id: "3-dev2-1703980800000",
        departmentId: "dev2",
        departmentName: "P. Phát triển phần mềm 2",
        status: "approved",
        submittedAt: "2025-09-26T14:35:00Z",
        reviewedAt: "2025-09-26T16:00:00Z",
        reviewer: "Trưởng phòng DEV2",
        reason: "Kinh nghiệm Vue.js và Laravel rất tốt, phù hợp với dự án frontend",
        note: "Có thể lead team frontend"
      },
      {
        id: "3-integration-1703980800000",
        departmentId: "integration",
        departmentName: "P. Giải pháp tích hợp",
        status: "approved",
        submittedAt: "2025-09-26T14:35:00Z",
        reviewedAt: "2025-09-26T16:15:00Z",
        reviewer: "Trưởng phòng Integration",
        reason: "Kinh nghiệm MySQL và Redis tốt cho hệ thống tích hợp",
        note: "Cần training về microservices"
      }
    ],
  },
  {
    id: 4,
    stt: 7,
    nguonHoSo: "Referral",
    viTri: "Data Engineer",
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
    donViUngTuyen: "R&D",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 8,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 95,
    status: "suitable",
    stage: "hired",
    skills: ["Kubernetes", "Terraform", "Jenkins", "Prometheus", "Grafana"],
    notes: "Chuyên gia DevOps với kinh nghiệm dày dặn",
    emailSent: true,
    lastEmailSent: "2025-09-29T16:20:00Z",
    emailStatusByStage: {
      "offer-congratulations": { sent: true, lastSent: "2025-09-29T16:20:00Z" }
    },
    createdAt: "2025-09-25T08:45:00Z",
    updatedAt: "2025-09-29T16:20:00Z",
    activities: [
      {
        id: 14,
        candidateId: 4,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-25T08:45:00Z",
      },
      {
        id: 15,
        candidateId: 4,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-25T08:50:00Z",
        details: { score: 95, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 16,
        candidateId: 4,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-25T09:00:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 17,
        candidateId: 4,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-25T10:30:00Z",
        details: { 
          reason: "Ứng viên xuất sắc với điểm số cao nhất, kinh nghiệm đa dạng với Vue.js và PostgreSQL. Rất phù hợp với vị trí senior.",
          department: "Phòng Công nghệ thông tin"
        },
      },
      {
        id: 18,
        candidateId: 4,
        action: "Gửi thư chúc mừng trúng tuyển",
        user: "HR Manager",
        timestamp: "2025-09-29T16:20:00Z",
      },
    ],
    // BPCM Reviews - Mixed results with some rejections
    bpcmReviews: [
      {
        id: "4-dev3-1703894400000",
        departmentId: "dev3",
        departmentName: "P. Phát triển phần mềm 3",
        status: "approved",
        submittedAt: "2025-09-25T09:00:00Z",
        reviewedAt: "2025-09-25T10:30:00Z",
        reviewer: "Trưởng phòng DEV3",
        reason: "Kinh nghiệm Vue.js và PostgreSQL rất tốt, phù hợp với dự án",
        note: "Có thể làm senior developer"
      },
      {
        id: "4-bigdata-1703894400000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "rejected",
        submittedAt: "2025-09-25T09:00:00Z",
        reviewedAt: "2025-09-25T11:00:00Z",
        reviewer: "Trưởng phòng Big Data",
        reason: "Thiếu kinh nghiệm về Spark và Hadoop",
        note: "Cần thêm kinh nghiệm về Big Data tools"
      },
      {
        id: "4-business-1703894400000",
        departmentId: "business",
        departmentName: "P. Kinh doanh",
        status: "pending",
        submittedAt: "2025-09-25T09:00:00Z"
      }
    ],
  },
  // Additional 10 CVs for testing
  {
    id: 8,
    stt: 8,
    nguonHoSo: "LinkedIn",
    viTri: "Backend Developer",
    hoVaTenDem: "Phạm Thị",
    ten: "Linh",
    gioiTinh: "Nữ",
    namSinh: 1990,
    sdt: "0123 987 654",
    email: "phamthilinh@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2014,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 9,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 82,
    status: "suitable",
    stage: "knowledge-test",
    skills: ["Java", "Spring Boot", "MySQL", "Redis", "Docker"],
    notes: "Chuyên gia backend với kinh nghiệm dày dặn",
    emailSent: true,
    lastEmailSent: "2025-09-30T10:30:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-09-30T10:30:00Z" }
    },
    createdAt: "2025-09-30T08:15:00Z",
    updatedAt: "2025-09-30T10:30:00Z",
    activities: [
      {
        id: 19,
        candidateId: 8,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T08:15:00Z",
      },
      {
        id: 20,
        candidateId: 8,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T08:20:00Z",
        details: { score: 82, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 21,
        candidateId: 8,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T08:30:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 22,
        candidateId: 8,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-30T09:45:00Z",
        details: { 
          reason: "Ứng viên có kinh nghiệm tốt với Java và Spring Boot, phù hợp với yêu cầu backend.",
          department: "Phòng Công nghệ thông tin"
        },
      },
      {
        id: 23,
        candidateId: 8,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T10:30:00Z",
      },
    ],
    // BPCM Reviews - Mixed results
    bpcmReviews: [
      {
        id: "8-dev1-1703844000000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "approved",
        submittedAt: "2025-09-30T08:30:00Z",
        reviewedAt: "2025-09-30T09:45:00Z",
        reviewer: "Trưởng phòng DEV1",
        reason: "Kinh nghiệm Java và Spring Boot rất tốt, phù hợp với dự án",
        note: "Có thể làm senior developer"
      },
      {
        id: "8-bigdata-1703844000000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "rejected",
        submittedAt: "2025-09-30T08:30:00Z",
        reviewedAt: "2025-09-30T10:00:00Z",
        reviewer: "Trưởng phòng Big Data",
        reason: "Thiếu kinh nghiệm về Apache Kafka và Spark",
        note: "Cần thêm kinh nghiệm về streaming data"
      },
      {
        id: "8-business-1703844000000",
        departmentId: "business",
        departmentName: "P. Kinh doanh",
        status: "pending",
        submittedAt: "2025-09-30T08:30:00Z"
      }
    ],
  },
  {
    id: 9,
    stt: 9,
    nguonHoSo: "Referral",
    viTri: "Fullstack Developer",
    hoVaTenDem: "Nguyễn Văn",
    ten: "Hùng",
    gioiTinh: "Nam",
    namSinh: 1988,
    sdt: "0456 789 123",
    email: "nguyenvanhung@email.com",
    truongDaoTao: "Đại học Khoa học Tự nhiên",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2012,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 11,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 91,
    status: "suitable",
    stage: "interview-1",
    skills: ["React", "Node.js", "MongoDB", "AWS", "Docker"],
    notes: "Fullstack developer có kinh nghiệm toàn diện",
    emailSent: true,
    lastEmailSent: "2025-09-30T11:45:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-09-30T10:00:00Z" },
      "interview-1": { sent: true, lastSent: "2025-09-30T11:45:00Z" }
    },
    createdAt: "2025-09-30T07:30:00Z",
    updatedAt: "2025-09-30T11:45:00Z",
    activities: [
      {
        id: 24,
        candidateId: 9,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T07:30:00Z",
      },
      {
        id: 25,
        candidateId: 9,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T07:35:00Z",
        details: { score: 91, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 26,
        candidateId: 9,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T07:45:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 27,
        candidateId: 9,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-30T08:30:00Z",
        details: { 
          reason: "Ứng viên có điểm số cao, kinh nghiệm đa dạng với Angular và MySQL. Rất phù hợp với vị trí.",
          department: "Phòng Công nghệ thông tin"
        },
      },
      {
        id: 28,
        candidateId: 9,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T10:00:00Z",
      },
      {
        id: 29,
        candidateId: 9,
        action: "Gửi thư mời phỏng vấn vòng 1",
        user: "HR Manager",
        timestamp: "2025-09-30T11:45:00Z",
      },
    ],
    // BPCM Reviews - All approved
    bpcmReviews: [
      {
        id: "9-dev2-1703844000000",
        departmentId: "dev2",
        departmentName: "P. Phát triển phần mềm 2",
        status: "approved",
        submittedAt: "2025-09-30T07:45:00Z",
        reviewedAt: "2025-09-30T08:30:00Z",
        reviewer: "Trưởng phòng DEV2",
        reason: "Kinh nghiệm Angular và MySQL rất tốt, phù hợp với fullstack",
        note: "Có thể lead team fullstack"
      },
      {
        id: "9-integration-1703844000000",
        departmentId: "integration",
        departmentName: "P. Giải pháp tích hợp",
        status: "approved",
        submittedAt: "2025-09-30T07:45:00Z",
        reviewedAt: "2025-09-30T08:45:00Z",
        reviewer: "Trưởng phòng Integration",
        reason: "Kinh nghiệm Node.js và MongoDB tốt cho microservices",
        note: "Có thể làm system architect"
      }
    ],
  },
  {
    id: 10,
    stt: 10,
    nguonHoSo: "Website tuyển dụng",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Trần Thị",
    ten: "Mai",
    gioiTinh: "Nữ",
    namSinh: 1993,
    sdt: "0789 123 456",
    email: "tranthimai@email.com",
    truongDaoTao: "Đại học Công nghệ Thông tin",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2017,
    thacSy: "Không",
    khuVuc: "Đà Nẵng",
    donViUngTuyen: "NOC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 6,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 87,
    status: "suitable",
    stage: "interview-2",
    skills: ["Kubernetes", "Docker", "Jenkins", "Terraform", "AWS"],
    notes: "DevOps engineer có kinh nghiệm cloud",
    emailSent: true,
    lastEmailSent: "2025-09-30T14:20:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-09-30T09:30:00Z" },
      "interview-1": { sent: true, lastSent: "2025-09-30T12:15:00Z" },
      "interview-2": { sent: true, lastSent: "2025-09-30T14:20:00Z" }
    },
    createdAt: "2025-09-30T06:45:00Z",
    updatedAt: "2025-09-30T14:20:00Z",
    activities: [
      {
        id: 19,
        candidateId: 10,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T06:45:00Z",
      },
      {
        id: 20,
        candidateId: 10,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T06:50:00Z",
        details: { score: 87, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 21,
        candidateId: 10,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T09:30:00Z",
      },
      {
        id: 22,
        candidateId: 10,
        action: "Gửi thư mời phỏng vấn vòng 1",
        user: "HR Manager",
        timestamp: "2025-09-30T12:15:00Z",
      },
      {
        id: 23,
        candidateId: 10,
        action: "Gửi thư mời phỏng vấn vòng 2",
        user: "HR Manager",
        timestamp: "2025-09-30T14:20:00Z",
      },
      {
        id: 68,
        candidateId: 10,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T07:00:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 69,
        candidateId: 10,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-30T08:30:00Z",
        details: { 
          reason: "Ứng viên có kinh nghiệm DevOps tốt với Docker, Kubernetes và AWS. Phù hợp với yêu cầu vị trí senior.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    // BPCM Reviews - All approved
    bpcmReviews: [
      {
        id: "10-dev3-1703844000000",
        departmentId: "dev3",
        departmentName: "P. Phát triển phần mềm 3",
        status: "approved",
        submittedAt: "2025-09-30T07:00:00Z",
        reviewedAt: "2025-09-30T08:30:00Z",
        reviewer: "Trưởng phòng DEV3",
        reason: "Kinh nghiệm Docker và Kubernetes rất tốt, phù hợp với DevOps",
        note: "Có thể làm DevOps lead"
      },
      {
        id: "10-bigdata-1703844000000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "approved",
        submittedAt: "2025-09-30T07:00:00Z",
        reviewedAt: "2025-09-30T08:45:00Z",
        reviewer: "Trưởng phòng Big Data",
        reason: "Kinh nghiệm AWS và Terraform tốt cho infrastructure",
        note: "Có thể setup data pipeline"
      }
    ],
  },
  {
    id: 11,
    stt: 11,
    nguonHoSo: "Referral",
    viTri: "Data Scientist",
    hoVaTenDem: "Lê Văn",
    ten: "Đức",
    gioiTinh: "Nam",
    namSinh: 1989,
    sdt: "0321 654 987",
    email: "levanduc@email.com",
    truongDaoTao: "Đại học Bách Khoa Hà Nội",
    heDaoTao: "Chính quy",
    chuyenNganh: "Khoa học máy tính",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2013,
    thacSy: "Có",
    khuVuc: "Hà Nội",
    donViUngTuyen: "R&D",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 10,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 94,
    status: "suitable",
    stage: "hired",
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL"],
    notes: "Data scientist xuất sắc với kinh nghiệm AI",
    emailSent: true,
    lastEmailSent: "2025-09-30T16:00:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-09-30T08:00:00Z" },
      "interview-1": { sent: true, lastSent: "2025-09-30T10:30:00Z" },
      "interview-2": { sent: true, lastSent: "2025-09-30T13:15:00Z" },
      "offer-congratulations": { sent: true, lastSent: "2025-09-30T16:00:00Z" }
    },
    createdAt: "2025-09-30T05:30:00Z",
    updatedAt: "2025-09-30T16:00:00Z",
    activities: [
      {
        id: 24,
        candidateId: 11,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T05:30:00Z",
      },
      {
        id: 25,
        candidateId: 11,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T05:35:00Z",
        details: { score: 94, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 26,
        candidateId: 11,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T08:00:00Z",
      },
      {
        id: 27,
        candidateId: 11,
        action: "Gửi thư mời phỏng vấn vòng 1",
        user: "HR Manager",
        timestamp: "2025-09-30T10:30:00Z",
      },
      {
        id: 28,
        candidateId: 11,
        action: "Gửi thư mời phỏng vấn vòng 2",
        user: "HR Manager",
        timestamp: "2025-09-30T13:15:00Z",
      },
      {
        id: 29,
        candidateId: 11,
        action: "Gửi thư chúc mừng trúng tuyển",
        user: "HR Manager",
        timestamp: "2025-09-30T16:00:00Z",
      },
      {
        id: 70,
        candidateId: 11,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T06:00:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 71,
        candidateId: 11,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-30T07:30:00Z",
        details: { 
          reason: "Ứng viên xuất sắc với điểm số cao nhất, kinh nghiệm đa dạng với React Native và Flutter. Rất phù hợp với vị trí senior.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    // BPCM Reviews - All approved
    bpcmReviews: [
      {
        id: "11-dev1-1703844000000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "approved",
        submittedAt: "2025-09-30T06:00:00Z",
        reviewedAt: "2025-09-30T07:30:00Z",
        reviewer: "Trưởng phòng DEV1",
        reason: "Kinh nghiệm React Native và Flutter rất tốt, phù hợp với mobile team",
        note: "Có thể lead mobile team"
      },
      {
        id: "11-iot-1703844000000",
        departmentId: "iot",
        departmentName: "BU IOT",
        status: "approved",
        submittedAt: "2025-09-30T06:00:00Z",
        reviewedAt: "2025-09-30T07:45:00Z",
        reviewer: "Trưởng phòng IOT",
        reason: "Kinh nghiệm Python và TensorFlow tốt cho AI/ML",
        note: "Có thể làm AI engineer"
      }
    ],
  },
  {
    id: 12,
    stt: 12,
    nguonHoSo: "LinkedIn",
    viTri: "Mobile Developer",
    hoVaTenDem: "Phạm Thị",
    ten: "Hoa",
    gioiTinh: "Nữ",
    namSinh: 1991,
    sdt: "0654 321 789",
    email: "phamthihoa@email.com",
    truongDaoTao: "Đại học Công nghệ Thông tin",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2015,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 8,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 79,
    status: "suitable",
    stage: "hired",
    skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    notes: "Mobile developer có kinh nghiệm cross-platform",
    emailSent: true,
    lastEmailSent: "2025-09-30T15:30:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-09-30T07:45:00Z" },
      "interview-1": { sent: true, lastSent: "2025-09-30T11:00:00Z" },
      "interview-2": { sent: true, lastSent: "2025-09-30T14:00:00Z" },
      "offer-congratulations": { sent: true, lastSent: "2025-09-30T15:30:00Z" }
    },
    createdAt: "2025-09-30T04:15:00Z",
    updatedAt: "2025-09-30T15:30:00Z",
    activities: [
      {
        id: 30,
        candidateId: 12,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T04:15:00Z",
      },
      {
        id: 31,
        candidateId: 12,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T04:20:00Z",
        details: { score: 79, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 32,
        candidateId: 12,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T07:45:00Z",
      },
      {
        id: 33,
        candidateId: 12,
        action: "Gửi thư mời phỏng vấn vòng 1",
        user: "HR Manager",
        timestamp: "2025-09-30T11:00:00Z",
      },
      {
        id: 34,
        candidateId: 12,
        action: "Gửi thư mời phỏng vấn vòng 2",
        user: "HR Manager",
        timestamp: "2025-09-30T14:00:00Z",
      },
      {
        id: 35,
        candidateId: 12,
        action: "Gửi thư chúc mừng trúng tuyển",
        user: "HR Manager",
        timestamp: "2025-09-30T15:30:00Z",
      },
      {
        id: 72,
        candidateId: 12,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T05:00:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 73,
        candidateId: 12,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-30T06:45:00Z",
        details: { 
          reason: "Ứng viên có kinh nghiệm mobile development tốt với React Native và iOS/Android. Phù hợp với yêu cầu vị trí.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    // BPCM Reviews - Mixed results
    bpcmReviews: [
      {
        id: "12-dev2-1703844000000",
        departmentId: "dev2",
        departmentName: "P. Phát triển phần mềm 2",
        status: "approved",
        submittedAt: "2025-09-30T05:00:00Z",
        reviewedAt: "2025-09-30T06:45:00Z",
        reviewer: "Trưởng phòng DEV2",
        reason: "Kinh nghiệm React Native và iOS/Android rất tốt",
        note: "Có thể làm mobile lead"
      },
      {
        id: "12-business-1703844000000",
        departmentId: "business",
        departmentName: "P. Kinh doanh",
        status: "rejected",
        submittedAt: "2025-09-30T05:00:00Z",
        reviewedAt: "2025-09-30T07:00:00Z",
        reviewer: "Trưởng phòng Kinh doanh",
        reason: "Thiếu kinh nghiệm về business analysis",
        note: "Cần thêm kinh nghiệm về market research"
      },
      {
        id: "12-accounting-1703844000000",
        departmentId: "accounting",
        departmentName: "P. Kế toán",
        status: "pending",
        submittedAt: "2025-09-30T05:00:00Z"
      }
    ],
  },
  {
    id: 13,
    stt: 13,
    nguonHoSo: "Website tuyển dụng",
    viTri: "QA Engineer",
    hoVaTenDem: "Nguyễn Văn",
    ten: "Tài",
    gioiTinh: "Nam",
    namSinh: 1994,
    sdt: "0987 123 456",
    email: "nguyenvantai@email.com",
    truongDaoTao: "Đại học Khoa học Tự nhiên",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2018,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 5,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 35,
    status: "unsuitable",
    stage: "rejected",
    skills: ["Selenium", "Jest", "Cypress", "Postman", "Git"],
    notes: "Ứng viên không đạt yêu cầu kỹ thuật",
    emailSent: true,
    lastEmailSent: "2025-09-30T12:00:00Z",
    emailStatusByStage: {
      "reject": { sent: true, lastSent: "2025-09-30T12:00:00Z" }
    },
    createdAt: "2025-09-30T03:00:00Z",
    updatedAt: "2025-09-30T12:00:00Z",
    activities: [
      {
        id: 36,
        candidateId: 13,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T03:00:00Z",
      },
      {
        id: 37,
        candidateId: 13,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T03:05:00Z",
        details: { score: 35, criteria_passed: 1, criteria_failed: 4 },
      },
      {
        id: 38,
        candidateId: 13,
        action: "Gửi thư từ chối",
        user: "HR Manager",
        timestamp: "2025-09-30T12:00:00Z",
      },
      {
        id: 74,
        candidateId: 13,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T04:00:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 75,
        candidateId: 13,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-30T05:30:00Z",
        details: { 
          reason: "Mặc dù điểm số thấp nhưng ứng viên có kinh nghiệm thực tế với hệ thống, có thể đào tạo thêm. Phù hợp với vị trí junior.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    // BPCM Reviews - All approved
    bpcmReviews: [
      {
        id: "13-dev3-1703844000000",
        departmentId: "dev3",
        departmentName: "P. Phát triển phần mềm 3",
        status: "approved",
        submittedAt: "2025-09-30T04:00:00Z",
        reviewedAt: "2025-09-30T05:30:00Z",
        reviewer: "Trưởng phòng DEV3",
        reason: "Kinh nghiệm Selenium và Jest tốt, có thể đào tạo thêm",
        note: "Cần training về automation testing"
      },
      {
        id: "13-integration-1703844000000",
        departmentId: "integration",
        departmentName: "P. Giải pháp tích hợp",
        status: "approved",
        submittedAt: "2025-09-30T04:00:00Z",
        reviewedAt: "2025-09-30T05:45:00Z",
        reviewer: "Trưởng phòng Integration",
        reason: "Kinh nghiệm Postman và API testing tốt",
        note: "Có thể làm integration testing"
      }
    ],
  },
  {
    id: 14,
    stt: 14,
    nguonHoSo: "Referral",
    viTri: "System Administrator",
    hoVaTenDem: "Trần Văn",
    ten: "Nam",
    gioiTinh: "Nam",
    namSinh: 1987,
    sdt: "0765 432 109",
    email: "tranvannam@email.com",
    truongDaoTao: "Đại học Bách Khoa Hà Nội",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2011,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "NOC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 12,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 41,
    status: "unsuitable",
    stage: "rejected",
    skills: ["Linux", "Windows Server", "VMware", "Docker", "Monitoring"],
    notes: "Kinh nghiệm không phù hợp với yêu cầu",
    emailSent: true,
    lastEmailSent: "2025-09-30T13:30:00Z",
    emailStatusByStage: {
      "reject": { sent: true, lastSent: "2025-09-30T13:30:00Z" }
    },
    createdAt: "2025-09-30T02:30:00Z",
    updatedAt: "2025-09-30T13:30:00Z",
    activities: [
      {
        id: 39,
        candidateId: 14,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T02:30:00Z",
      },
      {
        id: 40,
        candidateId: 14,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T02:35:00Z",
        details: { score: 41, criteria_passed: 2, criteria_failed: 3 },
      },
      {
        id: 41,
        candidateId: 14,
        action: "Gửi thư từ chối",
        user: "HR Manager",
        timestamp: "2025-09-30T13:30:00Z",
      },
      {
        id: 76,
        candidateId: 14,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T03:00:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 77,
        candidateId: 14,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-09-30T04:15:00Z",
        details: { 
          reason: "Ứng viên có kinh nghiệm quản trị hệ thống tốt, phù hợp với vị trí System Administrator. Có thể đào tạo thêm về cloud.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    // BPCM Reviews - Mixed results
    bpcmReviews: [
      {
        id: "14-dev1-1703844000000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "approved",
        submittedAt: "2025-09-30T03:00:00Z",
        reviewedAt: "2025-09-30T04:15:00Z",
        reviewer: "Trưởng phòng DEV1",
        reason: "Kinh nghiệm Linux và Windows Server tốt",
        note: "Có thể làm system admin"
      },
      {
        id: "14-bigdata-1703844000000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "rejected",
        submittedAt: "2025-09-30T03:00:00Z",
        reviewedAt: "2025-09-30T04:30:00Z",
        reviewer: "Trưởng phòng Big Data",
        reason: "Thiếu kinh nghiệm về Hadoop và Spark",
        note: "Cần thêm kinh nghiệm về distributed systems"
      },
      {
        id: "14-iot-1703844000000",
        departmentId: "iot",
        departmentName: "BU IOT",
        status: "pending",
        submittedAt: "2025-09-30T03:00:00Z"
      }
    ],
  },
  {
    id: 15,
    stt: 15,
    nguonHoSo: "LinkedIn",
    viTri: "Product Manager",
    hoVaTenDem: "Lê Thị",
    ten: "Lan",
    gioiTinh: "Nữ",
    namSinh: 1992,
    sdt: "0543 210 987",
    email: "lethilan@email.com",
    truongDaoTao: "Đại học Kinh tế Quốc dân",
    heDaoTao: "Chính quy",
    chuyenNganh: "Quản trị kinh doanh",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2016,
    thacSy: "Có",
    khuVuc: "Hà Nội",
    donViUngTuyen: "R&D",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 7,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 88,
    status: "suitable",
    stage: "hired",
    skills: ["Product Management", "Agile", "Scrum", "Analytics", "User Research"],
    notes: "Product manager có kinh nghiệm quản lý sản phẩm",
    emailSent: true,
    lastEmailSent: "2025-09-30T17:15:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-09-30T06:30:00Z" },
      "interview-1": { sent: true, lastSent: "2025-09-30T09:45:00Z" },
      "interview-2": { sent: true, lastSent: "2025-09-30T12:30:00Z" },
      "offer-congratulations": { sent: true, lastSent: "2025-09-30T17:15:00Z" }
    },
    createdAt: "2025-09-30T01:45:00Z",
    updatedAt: "2025-09-30T17:15:00Z",
    activities: [
      {
        id: 42,
        candidateId: 15,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T01:45:00Z",
      },
      {
        id: 43,
        candidateId: 15,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T01:50:00Z",
        details: { score: 88, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 44,
        candidateId: 15,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T06:30:00Z",
      },
      {
        id: 45,
        candidateId: 15,
        action: "Gửi thư mời phỏng vấn vòng 1",
        user: "HR Manager",
        timestamp: "2025-09-30T09:45:00Z",
      },
      {
        id: 46,
        candidateId: 15,
        action: "Gửi thư mời phỏng vấn vòng 2",
        user: "HR Manager",
        timestamp: "2025-09-30T12:30:00Z",
      },
      {
        id: 47,
        candidateId: 15,
        action: "Gửi thư chúc mừng trúng tuyển",
        user: "HR Manager",
        timestamp: "2025-09-30T17:15:00Z",
      },
      {
        id: 78,
        candidateId: 15,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T05:00:00Z",
        details: { department: "Phòng Sản phẩm và Dịch vụ" },
      },
      {
        id: 79,
        candidateId: 15,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng Sản phẩm",
        timestamp: "2025-09-30T06:30:00Z",
        details: { 
          reason: "Ứng viên có kinh nghiệm quản lý sản phẩm tốt, kỹ năng phân tích và lập kế hoạch. Rất phù hợp với vị trí Product Manager.",
          department: "Phòng Sản phẩm và Dịch vụ"
        },
      },
    ],
    // BPCM Reviews - All approved
    bpcmReviews: [
      {
        id: "15-business-1703844000000",
        departmentId: "business",
        departmentName: "P. Kinh doanh",
        status: "approved",
        submittedAt: "2025-09-30T05:00:00Z",
        reviewedAt: "2025-09-30T06:30:00Z",
        reviewer: "Trưởng phòng Kinh doanh",
        reason: "Kinh nghiệm quản lý sản phẩm và phân tích thị trường tốt",
        note: "Có thể làm product lead"
      },
      {
        id: "15-accounting-1703844000000",
        departmentId: "accounting",
        departmentName: "P. Kế toán",
        status: "approved",
        submittedAt: "2025-09-30T05:00:00Z",
        reviewedAt: "2025-09-30T06:45:00Z",
        reviewer: "Trưởng phòng Kế toán",
        reason: "Kinh nghiệm tài chính và budgeting tốt",
        note: "Có thể làm financial analyst"
      }
    ],
  },
  {
    id: 16,
    stt: 16,
    nguonHoSo: "Website tuyển dụng",
    viTri: "UI/UX Designer",
    hoVaTenDem: "Phạm Văn",
    ten: "Long",
    gioiTinh: "Nam",
    namSinh: 1995,
    sdt: "0891 234 567",
    email: "phamvanlong@email.com",
    truongDaoTao: "Đại học Mỹ thuật Công nghiệp",
    heDaoTao: "Chính quy",
    chuyenNganh: "Thiết kế đồ họa",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2019,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 4,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 73,
    status: "suitable",
    stage: "interview-1",
    skills: ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"],
    notes: "UI/UX designer có portfolio ấn tượng",
    emailSent: true,
    lastEmailSent: "2025-09-30T11:30:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-09-30T08:15:00Z" },
      "interview-1": { sent: true, lastSent: "2025-09-30T11:30:00Z" }
    },
    createdAt: "2025-09-30T00:30:00Z",
    updatedAt: "2025-09-30T11:30:00Z",
    activities: [
      {
        id: 48,
        candidateId: 16,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T00:30:00Z",
      },
      {
        id: 49,
        candidateId: 16,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T00:35:00Z",
        details: { score: 73, criteria_passed: 3, criteria_failed: 2 },
      },
      {
        id: 50,
        candidateId: 16,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T08:15:00Z",
      },
      {
        id: 51,
        candidateId: 16,
        action: "Gửi thư mời phỏng vấn vòng 1",
        user: "HR Manager",
        timestamp: "2025-09-30T11:30:00Z",
      },
      {
        id: 80,
        candidateId: 16,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-09-30T07:00:00Z",
        details: { department: "Phòng Sáng tạo và Nội dung" },
      },
      {
        id: 81,
        candidateId: 16,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNC",
        timestamp: "2025-09-30T08:30:00Z",
        details: { 
          reason: "Ứng viên có kinh nghiệm thiết kế UI/UX tốt, kỹ năng sử dụng các công cụ design hiện đại. Phù hợp với yêu cầu vị trí senior.",
          department: "Phòng Sáng tạo và Nội dung"
        },
      },
    ],
    // BPCM Reviews - All approved
    bpcmReviews: [
      {
        id: "16-dev2-1703844000000",
        departmentId: "dev2",
        departmentName: "P. Phát triển phần mềm 2",
        status: "approved",
        submittedAt: "2025-09-30T07:00:00Z",
        reviewedAt: "2025-09-30T08:30:00Z",
        reviewer: "Trưởng phòng DEV2",
        reason: "Kinh nghiệm Figma và Adobe XD rất tốt, phù hợp với frontend team",
        note: "Có thể làm design lead"
      },
      {
        id: "16-integration-1703844000000",
        departmentId: "integration",
        departmentName: "P. Giải pháp tích hợp",
        status: "approved",
        submittedAt: "2025-09-30T07:00:00Z",
        reviewedAt: "2025-09-30T08:45:00Z",
        reviewer: "Trưởng phòng Integration",
        reason: "Kinh nghiệm Sketch và InVision tốt cho prototyping",
        note: "Có thể làm UX researcher"
      }
    ],
  },
  // CV bị BPCM reject
  {
    id: 17,
    stt: 17,
    nguonHoSo: "Website tuyển dụng",
    viTri: "Senior Developer",
    hoVaTenDem: "Nguyễn Văn",
    ten: "Bình",
    gioiTinh: "Nam",
    namSinh: 1988,
    sdt: "0901 234 567",
    email: "nguyenvanbinh@email.com",
    truongDaoTao: "Đại học Công nghệ",
    heDaoTao: "Chính quy",
    chuyenNganh: "Khoa học máy tính",
    loaiTotNghiep: "Khá",
    namTotNghiep: 2012,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 12,
    lyDoLoai: "Thiếu kinh nghiệm về microservices",
    donViSangLocHS: "HR Team",
    score: 75,
    status: "unsuitable",
    stage: "bpcm-rejected",
    skills: ["Java", "Spring", "MySQL", "JavaScript"],
    notes: "Ứng viên có kinh nghiệm lâu năm nhưng thiếu kỹ năng hiện đại",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-01T09:00:00Z",
    updatedAt: "2025-10-01T11:30:00Z",
    activities: [
      {
        id: 40,
        candidateId: 17,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-01T09:00:00Z",
      },
      {
        id: 41,
        candidateId: 17,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-01T09:05:00Z",
        details: { score: 75, criteria_passed: 3, criteria_failed: 2 },
      },
      {
        id: 42,
        candidateId: 17,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-01T09:15:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 43,
        candidateId: 17,
        action: "BPCM từ chối ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-10-01T11:30:00Z",
        details: { 
          reason: "Thiếu kinh nghiệm về microservices và cloud architecture. Kỹ năng công nghệ cũ, không phù hợp với yêu cầu hiện tại của dự án.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    // BPCM Reviews - All rejected
    bpcmReviews: [
      {
        id: "17-dev1-1703844000000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "rejected",
        submittedAt: "2025-10-01T09:15:00Z",
        reviewedAt: "2025-10-01T11:30:00Z",
        reviewer: "Trưởng phòng DEV1",
        reason: "Thiếu kinh nghiệm về microservices và cloud architecture",
        note: "Kỹ năng công nghệ cũ, không phù hợp với yêu cầu hiện tại"
      },
      {
        id: "17-bigdata-1703844000000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "rejected",
        submittedAt: "2025-10-01T09:15:00Z",
        reviewedAt: "2025-10-01T11:45:00Z",
        reviewer: "Trưởng phòng Big Data",
        reason: "Thiếu kinh nghiệm về Apache Kafka và Spark",
        note: "Cần thêm kinh nghiệm về streaming data"
      },
      {
        id: "17-iot-1703844000000",
        departmentId: "iot",
        departmentName: "BU IOT",
        status: "rejected",
        submittedAt: "2025-10-01T09:15:00Z",
        reviewedAt: "2025-10-01T12:00:00Z",
        reviewer: "Trưởng phòng IOT",
        reason: "Thiếu kinh nghiệm về IoT protocols và edge computing",
        note: "Cần thêm kinh nghiệm về MQTT và CoAP"
      }
    ],
  },
  {
    id: 18,
    stt: 18,
    nguonHoSo: "LinkedIn",
    viTri: "Product Manager",
    hoVaTenDem: "Trần Thị",
    ten: "Hương",
    gioiTinh: "Nữ",
    namSinh: 1991,
    sdt: "0987 123 456",
    email: "tranthihuong@email.com",
    truongDaoTao: "Đại học Kinh tế",
    heDaoTao: "Chính quy",
    chuyenNganh: "Quản trị kinh doanh",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2014,
    thacSy: "Có",
    khuVuc: "Hà Nội",
    donViUngTuyen: "Sản phẩm",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 8,
    lyDoLoai: "Thiếu kinh nghiệm trong lĩnh vực fintech",
    donViSangLocHS: "HR Team",
    score: 78,
    status: "unsuitable",
    stage: "bpcm-rejected",
    skills: ["Product Management", "Agile", "Scrum", "Analytics"],
    notes: "Ứng viên có kinh nghiệm PM tốt nhưng chưa có background fintech",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-01T10:30:00Z",
    updatedAt: "2025-10-01T14:45:00Z",
    activities: [
      {
        id: 44,
        candidateId: 18,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-01T10:30:00Z",
      },
      {
        id: 45,
        candidateId: 18,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-01T10:35:00Z",
        details: { score: 78, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 46,
        candidateId: 18,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-01T10:45:00Z",
        details: { department: "Phòng Sản phẩm" },
      },
      {
        id: 47,
        candidateId: 18,
        action: "BPCM từ chối ứng viên",
        user: "Trưởng phòng Sản phẩm",
        timestamp: "2025-10-01T14:45:00Z",
        details: { 
          reason: "Thiếu kinh nghiệm trong lĩnh vực fintech và payment. Cần ứng viên có background về tài chính và hiểu rõ các quy định pháp lý trong ngành.",
          department: "Phòng Sản phẩm"
        },
      },
    ],
    // BPCM Reviews - All rejected
    bpcmReviews: [
      {
        id: "18-business-1703844000000",
        departmentId: "business",
        departmentName: "P. Kinh doanh",
        status: "rejected",
        submittedAt: "2025-10-01T10:45:00Z",
        reviewedAt: "2025-10-01T14:45:00Z",
        reviewer: "Trưởng phòng Kinh doanh",
        reason: "Thiếu kinh nghiệm trong lĩnh vực fintech và payment",
        note: "Cần ứng viên có background về tài chính"
      },
      {
        id: "18-accounting-1703844000000",
        departmentId: "accounting",
        departmentName: "P. Kế toán",
        status: "rejected",
        submittedAt: "2025-10-01T10:45:00Z",
        reviewedAt: "2025-10-01T15:00:00Z",
        reviewer: "Trưởng phòng Kế toán",
        reason: "Thiếu kinh nghiệm về financial regulations",
        note: "Cần hiểu rõ các quy định pháp lý trong ngành"
      }
    ],
  },
  {
    id: 19,
    stt: 19,
    nguonHoSo: "Website tuyển dụng",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Lê Văn",
    ten: "Tùng",
    gioiTinh: "Nam",
    namSinh: 1989,
    sdt: "0912 345 678",
    email: "levantung@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Khá",
    namTotNghiep: 2013,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 10,
    lyDoLoai: "Kỹ năng DevOps cơ bản, chưa đáp ứng yêu cầu senior",
    donViSangLocHS: "HR Team",
    score: 72,
    status: "unsuitable",
    stage: "bpcm-rejected",
    skills: ["Docker", "Linux", "Bash", "Jenkins"],
    notes: "Ứng viên có kinh nghiệm DevOps cơ bản nhưng thiếu kỹ năng advanced",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-01T11:15:00Z",
    updatedAt: "2025-10-01T16:20:00Z",
    activities: [
      {
        id: 48,
        candidateId: 19,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-01T11:15:00Z",
      },
      {
        id: 49,
        candidateId: 19,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-01T11:20:00Z",
        details: { score: 72, criteria_passed: 3, criteria_failed: 2 },
      },
      {
        id: 50,
        candidateId: 19,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-01T11:30:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 51,
        candidateId: 19,
        action: "BPCM từ chối ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-10-01T16:20:00Z",
        details: { 
          reason: "Kỹ năng DevOps cơ bản, thiếu kinh nghiệm với Kubernetes, Terraform, và cloud platforms (AWS/Azure). Cần ứng viên có level senior để đảm nhiệm vị trí này.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    // BPCM Reviews - All rejected
    bpcmReviews: [
      {
        id: "19-dev3-1703844000000",
        departmentId: "dev3",
        departmentName: "P. Phát triển phần mềm 3",
        status: "rejected",
        submittedAt: "2025-10-01T11:30:00Z",
        reviewedAt: "2025-10-01T16:20:00Z",
        reviewer: "Trưởng phòng DEV3",
        reason: "Kỹ năng DevOps cơ bản, thiếu kinh nghiệm với Kubernetes",
        note: "Cần ứng viên có level senior"
      },
      {
        id: "19-bigdata-1703844000000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "rejected",
        submittedAt: "2025-10-01T11:30:00Z",
        reviewedAt: "2025-10-01T16:35:00Z",
        reviewer: "Trưởng phòng Big Data",
        reason: "Thiếu kinh nghiệm với Terraform và cloud platforms",
        note: "Cần thêm kinh nghiệm về AWS/Azure"
      }
    ],
  },
  // CV đã được BPCM đồng ý
  {
    id: 20,
    stt: 20,
    nguonHoSo: "Website tuyển dụng",
    viTri: "Full-stack Developer",
    hoVaTenDem: "Phạm Thị",
    ten: "Mai",
    gioiTinh: "Nữ",
    namSinh: 1993,
    sdt: "0934 567 890",
    email: "phamthimai@email.com",
    truongDaoTao: "Đại học Công nghệ thông tin",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2016,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 6,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 88,
    status: "suitable",
    stage: "knowledge-test",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    notes: "Ứng viên có kỹ năng full-stack tốt và kinh nghiệm cloud",
    emailSent: true,
    lastEmailSent: "2025-10-01T15:30:00Z",
    emailStatusByStage: {
      "knowledge-test": { sent: true, lastSent: "2025-10-01T15:30:00Z" }
    },
    createdAt: "2025-10-01T12:00:00Z",
    updatedAt: "2025-10-01T15:30:00Z",
    activities: [
      {
        id: 52,
        candidateId: 20,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-01T12:00:00Z",
      },
      {
        id: 53,
        candidateId: 20,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-01T12:05:00Z",
        details: { score: 88, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 54,
        candidateId: 20,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-01T12:15:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 55,
        candidateId: 20,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: "2025-10-01T14:20:00Z",
        details: { 
          reason: "Ứng viên có kỹ năng full-stack tốt, kinh nghiệm với cloud và modern tech stack. Phù hợp với yêu cầu dự án.",
          department: "Phòng Công nghệ thông tin"
        },
      },
      {
        id: 56,
        candidateId: 20,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-10-01T15:30:00Z",
      },
    ],
    // BPCM Reviews - All approved
    bpcmReviews: [
      {
        id: "20-dev1-1703844000000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "approved",
        submittedAt: "2025-10-01T12:15:00Z",
        reviewedAt: "2025-10-01T14:20:00Z",
        reviewer: "Trưởng phòng DEV1",
        reason: "Kỹ năng full-stack tốt, kinh nghiệm với cloud và modern tech stack",
        note: "Phù hợp với yêu cầu dự án"
      },
      {
        id: "20-integration-1703844000000",
        departmentId: "integration",
        departmentName: "P. Giải pháp tích hợp",
        status: "approved",
        submittedAt: "2025-10-01T12:15:00Z",
        reviewedAt: "2025-10-01T14:35:00Z",
        reviewer: "Trưởng phòng Integration",
        reason: "Kinh nghiệm microservices và API design tốt",
        note: "Có thể làm system architect"
      }
    ],
  },
  // Fake candidates for BPCM testing
  {
    id: 21,
    stt: 21,
    nguonHoSo: "Website tuyển dụng",
    viTri: "Frontend Developer",
    hoVaTenDem: "Nguyễn Thị",
    ten: "Hương",
    gioiTinh: "Nữ",
    namSinh: 1992,
    sdt: "0987 654 321",
    email: "nguyenthihuong@email.com",
    truongDaoTao: "Đại học Công nghệ Thông tin",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2016,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 7,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 88,
    status: "suitable",
    stage: "bpcm-pending",
    skills: ["React", "Vue.js", "TypeScript", "CSS", "JavaScript"],
    notes: "Ứng viên có kinh nghiệm frontend tốt",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-02T09:00:00Z",
    updatedAt: "2025-10-02T09:00:00Z",
    activities: [
      {
        id: 82,
        candidateId: 21,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-02T09:00:00Z",
      },
      {
        id: 83,
        candidateId: 21,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-02T09:05:00Z",
        details: { score: 88, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 84,
        candidateId: 21,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-02T09:30:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
    ],
    // BPCM Reviews - All pending
    bpcmReviews: [
      {
        id: "21-dev1-1703844000000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "pending",
        submittedAt: "2025-10-02T09:30:00Z"
      },
      {
        id: "21-dev2-1703844000000",
        departmentId: "dev2",
        departmentName: "P. Phát triển phần mềm 2",
        status: "pending",
        submittedAt: "2025-10-02T09:30:00Z"
      }
    ],
  },
  {
    id: 22,
    stt: 22,
    nguonHoSo: "LinkedIn",
    viTri: "Backend Developer",
    hoVaTenDem: "Trần Văn",
    ten: "Minh",
    gioiTinh: "Nam",
    namSinh: 1988,
    sdt: "0912 345 678",
    email: "tranvanminh@email.com",
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
    score: 92,
    status: "suitable",
    stage: "bpcm-pending",
    skills: ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
    notes: "Ứng viên senior với kinh nghiệm backend phong phú",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-02T10:15:00Z",
    updatedAt: "2025-10-02T10:15:00Z",
    activities: [
      {
        id: 85,
        candidateId: 22,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-02T10:15:00Z",
      },
      {
        id: 86,
        candidateId: 22,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-02T10:20:00Z",
        details: { score: 92, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 87,
        candidateId: 22,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-02T10:45:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
    ],
    // BPCM Reviews - All pending
    bpcmReviews: [
      {
        id: "22-dev3-1703844000000",
        departmentId: "dev3",
        departmentName: "P. Phát triển phần mềm 3",
        status: "pending",
        submittedAt: "2025-10-02T10:45:00Z"
      },
      {
        id: "22-bigdata-1703844000000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "pending",
        submittedAt: "2025-10-02T10:45:00Z"
      }
    ],
  },
  {
    id: 23,
    stt: 23,
    nguonHoSo: "Referral",
    viTri: "Full-stack Developer",
    hoVaTenDem: "Lê Thị",
    ten: "Linh",
    gioiTinh: "Nữ",
    namSinh: 1995,
    sdt: "0966 777 888",
    email: "lethilinh@email.com",
    truongDaoTao: "Đại học Khoa học Tự nhiên",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2018,
    thacSy: "Không",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 6,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 85,
    status: "suitable",
    stage: "bpcm-pending",
    skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
    notes: "Ứng viên full-stack với kỹ năng đa dạng",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-02T11:30:00Z",
    updatedAt: "2025-10-02T11:30:00Z",
    activities: [
      {
        id: 88,
        candidateId: 23,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-02T11:30:00Z",
      },
      {
        id: 89,
        candidateId: 23,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-02T11:35:00Z",
        details: { score: 85, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 90,
        candidateId: 23,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-02T12:00:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
    ],
    // BPCM Reviews - All pending
    bpcmReviews: [
      {
        id: "23-integration-1703844000000",
        departmentId: "integration",
        departmentName: "P. Giải pháp tích hợp",
        status: "pending",
        submittedAt: "2025-10-02T12:00:00Z"
      },
      {
        id: "23-iot-1703844000000",
        departmentId: "iot",
        departmentName: "BU IOT",
        status: "pending",
        submittedAt: "2025-10-02T12:00:00Z"
      }
    ],
  },
  {
    id: 24,
    stt: 24,
    nguonHoSo: "Website tuyển dụng",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Phạm Văn",
    ten: "Hùng",
    gioiTinh: "Nam",
    namSinh: 1990,
    sdt: "0933 444 555",
    email: "phamvanhung@email.com",
    truongDaoTao: "Đại học Công nghệ Thông tin",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2014,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 9,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 90,
    status: "suitable",
    stage: "bpcm-pending",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins"],
    notes: "Ứng viên DevOps với kinh nghiệm cloud",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-02T14:00:00Z",
    updatedAt: "2025-10-02T14:00:00Z",
    activities: [
      {
        id: 91,
        candidateId: 24,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-02T14:00:00Z",
      },
      {
        id: 92,
        candidateId: 24,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-02T14:05:00Z",
        details: { score: 90, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 93,
        candidateId: 24,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-02T14:30:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
    ],
    // BPCM Reviews - All pending
    bpcmReviews: [
      {
        id: "24-dev1-1703844000000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "pending",
        submittedAt: "2025-10-02T14:30:00Z"
      },
      {
        id: "24-dev2-1703844000000",
        departmentId: "dev2",
        departmentName: "P. Phát triển phần mềm 2",
        status: "pending",
        submittedAt: "2025-10-02T14:30:00Z"
      },
      {
        id: "24-bigdata-1703844000000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "pending",
        submittedAt: "2025-10-02T14:30:00Z"
      }
    ],
  },
  {
    id: 25,
    stt: 25,
    nguonHoSo: "LinkedIn",
    viTri: "Mobile Developer",
    hoVaTenDem: "Nguyễn Thị",
    ten: "Mai",
    gioiTinh: "Nữ",
    namSinh: 1993,
    sdt: "0944 555 666",
    email: "nguyenthimai@email.com",
    truongDaoTao: "Đại học Bách Khoa Hà Nội",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2017,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 7,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 87,
    status: "suitable",
    stage: "bpcm-pending",
    skills: ["React Native", "Flutter", "iOS", "Android", "JavaScript"],
    notes: "Ứng viên mobile với kinh nghiệm cross-platform",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-02T15:45:00Z",
    updatedAt: "2025-10-02T15:45:00Z",
    activities: [
      {
        id: 94,
        candidateId: 25,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-02T15:45:00Z",
      },
      {
        id: 95,
        candidateId: 25,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-02T15:50:00Z",
        details: { score: 87, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 96,
        candidateId: 25,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-02T16:15:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
    ],
    // BPCM Reviews - All pending
    bpcmReviews: [
      {
        id: "25-dev3-1703844000000",
        departmentId: "dev3",
        departmentName: "P. Phát triển phần mềm 3",
        status: "pending",
        submittedAt: "2025-10-02T16:15:00Z"
      },
      {
        id: "25-integration-1703844000000",
        departmentId: "integration",
        departmentName: "P. Giải pháp tích hợp",
        status: "pending",
        submittedAt: "2025-10-02T16:15:00Z"
      }
    ],
  },
  {
    id: 26,
    stt: 26,
    nguonHoSo: "Website tuyển dụng",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Lê Văn",
    ten: "Tùng",
    gioiTinh: "Nam",
    namSinh: 1988,
    sdt: "0911 222 333",
    email: "levantung@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2012,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNTT",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 12,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 91,
    status: "suitable",
    stage: "bpcm-pending",
    skills: ["Kubernetes", "Docker", "AWS", "Terraform", "Jenkins", "Prometheus"],
    notes: "Ứng viên có kinh nghiệm DevOps rất tốt, phù hợp với vị trí senior",
    emailSent: false,
    lastEmailSent: undefined,
    emailStatusByStage: {},
    createdAt: "2025-10-03T08:00:00Z",
    updatedAt: "2025-10-03T08:00:00Z",
    activities: [
      {
        id: 97,
        candidateId: 26,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-10-03T08:00:00Z",
      },
      {
        id: 98,
        candidateId: 26,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-10-03T08:05:00Z",
        details: { score: 91, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 99,
        candidateId: 26,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: "2025-10-03T08:15:00Z",
        details: { department: "Phòng Công nghệ thông tin" },
      },
    ],
    // BPCM Reviews - All pending
    bpcmReviews: [
      {
        id: "26-dev1-1704172800000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "pending",
        submittedAt: "2025-10-03T08:15:00Z"
      },
      {
        id: "26-dev2-1704172800000",
        departmentId: "dev2",
        departmentName: "P. Phát triển phần mềm 2",
        status: "pending",
        submittedAt: "2025-10-03T08:15:00Z"
      },
      {
        id: "26-bigdata-1704172800000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "pending",
        submittedAt: "2025-10-03T08:15:00Z"
      }
    ],
  },
  // CV BPCM đã duyệt - 1
  {
    id: 27,
    stt: 27,
    nguonHoSo: "Website tuyển dụng",
    viTri: "Backend Developer",
    hoVaTenDem: "Võ Thị",
    ten: "Hương",
    gioiTinh: "Nữ",
    namSinh: 1991,
    sdt: "0901 234 567",
    email: "vothihuong@email.com",
    truongDaoTao: "Đại học Bách Khoa TP.HCM",
    heDaoTao: "Chính quy",
    chuyenNganh: "Công nghệ thông tin",
    loaiTotNghiep: "Xuất sắc",
    namTotNghiep: 2014,
    thacSy: "Có",
    khuVuc: "TP.HCM",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 9,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 89,
    status: "suitable",
    stage: "bpcm-approved",
    skills: ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes", "PostgreSQL"],
    notes: "Senior Backend Developer với kinh nghiệm microservices",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 100,
        candidateId: 27,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: new Date(new Date().getTime() + 1000).toISOString(),
      },
      {
        id: 101,
        candidateId: 27,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: new Date(new Date().getTime() + 2000).toISOString(),
        details: { score: 89, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 102,
        candidateId: 27,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: new Date(new Date().getTime() + 3000).toISOString(),
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 103,
        candidateId: 27,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: new Date(new Date().getTime() + 4000).toISOString(),
        details: {
          reason: "Ứng viên có kinh nghiệm Java và microservices rất tốt, phù hợp với yêu cầu dự án.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    bpcmReviews: [
      {
        id: "27-dev1-1704067200000",
        departmentId: "dev1",
        departmentName: "P. Phát triển phần mềm 1",
        status: "approved",
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
        reviewer: "Trưởng phòng DEV1",
        reason: "Kinh nghiệm Java và Spring Boot rất tốt, phù hợp với team backend",
        note: "Có thể làm tech lead"
      },
      {
        id: "27-bigdata-1704067200000",
        departmentId: "bigdata",
        departmentName: "P. Big Data",
        status: "approved",
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
        reviewer: "Trưởng phòng Big Data",
        reason: "Kinh nghiệm Docker và Kubernetes rất tốt cho dự án Big Data",
        note: "Cần training thêm về Spark"
      }
    ]
  },
  // CV BPCM đã duyệt - 2
  {
    id: 28,
    stt: 28,
    nguonHoSo: "LinkedIn",
    viTri: "DevOps Engineer",
    hoVaTenDem: "Lê Văn",
    ten: "Tùng",
    gioiTinh: "Nam",
    namSinh: 1989,
    sdt: "0912 345 678",
    email: "levantung@email.com",
    truongDaoTao: "Đại học Công nghệ",
    heDaoTao: "Chính quy",
    chuyenNganh: "Kỹ thuật phần mềm",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2012,
    thacSy: "Có",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 11,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 92,
    status: "suitable",
    stage: "bpcm-approved",
    skills: ["AWS", "Azure", "Terraform", "Jenkins", "GitLab CI/CD", "Kubernetes", "Docker"],
    notes: "Senior DevOps Engineer với kinh nghiệm cloud và automation",
    emailSent: false,
    lastEmailSent: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 104,
        candidateId: 28,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: new Date(new Date().getTime() + 1000).toISOString(),
      },
      {
        id: 105,
        candidateId: 28,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: new Date(new Date().getTime() + 2000).toISOString(),
        details: { score: 92, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 106,
        candidateId: 28,
        action: "Gửi CV đến BPCM duyệt",
        user: "HR Manager",
        timestamp: new Date(new Date().getTime() + 3000).toISOString(),
        details: { department: "Phòng Công nghệ thông tin" },
      },
      {
        id: 107,
        candidateId: 28,
        action: "BPCM đồng ý ứng viên",
        user: "Trưởng phòng CNTT",
        timestamp: new Date(new Date().getTime() + 4000).toISOString(),
        details: {
          reason: "Ứng viên có kinh nghiệm DevOps và cloud rất tốt, phù hợp với yêu cầu infrastructure.",
          department: "Phòng Công nghệ thông tin"
        },
      },
    ],
    bpcmReviews: [
      {
        id: "28-dev2-1704067200000",
        departmentId: "dev2",
        departmentName: "P. Phát triển phần mềm 2",
        status: "approved",
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
        reviewer: "Trưởng phòng DEV2",
        reason: "Kinh nghiệm AWS và Terraform rất tốt, phù hợp với team DevOps",
        note: "Có thể lead team DevOps"
      },
      {
        id: "28-integration-1704067200000",
        departmentId: "integration",
        departmentName: "P. Giải pháp tích hợp",
        status: "rejected",
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
        reviewer: "Trưởng phòng Integration",
        reason: "Kinh nghiệm Kubernetes và Docker rất tốt cho hệ thống tích hợp",
        note: "Cần training về microservices"
      }
    ]
  },
]

export function useHRData() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [filters, setFilters] = useState<FilterState>({
    position: "all",
    stage: "all",
    status: "all",
    search: "",
    examBatch: "all",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Get all candidates (for reference)
  const allCandidates = candidates

  // Filter candidates based on current filters
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesPosition = filters.position === "all" || candidate.viTri.toLowerCase().includes(filters.position.toLowerCase())
    const matchesStage = filters.stage === "all" || candidate.stage === filters.stage
    // AI result derived from score with 3 categories
    let derivedAIStatus: string
    if (candidate.score < 30) {
      derivedAIStatus = "unsuitable"
    } else if (candidate.score >= 30 && candidate.score < 70) {
      derivedAIStatus = "suitable-form2"
    } else {
      derivedAIStatus = "suitable-form1"
    }
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

  // Update candidate status
  const updateCandidateStatus = useCallback((candidateId: number, status: Candidate["status"]) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, status, updatedAt: new Date().toISOString() }
          : candidate
      )
    )
  }, [])

  // Update candidate email status
  const updateCandidateEmailStatus = useCallback((candidateId: number, emailSent: boolean, lastEmailSent?: string, stage?: string) => {
    setCandidates(prev => 
      prev.map(candidate => {
        if (candidate.id === candidateId) {
          const currentStage = stage || candidate.stage
          const emailStatusByStage = candidate.emailStatusByStage || {}
          
          return {
            ...candidate, 
            emailSent, 
            lastEmailSent: lastEmailSent || new Date().toISOString(),
            emailStatusByStage: {
              ...emailStatusByStage,
              [currentStage]: {
                sent: emailSent,
                lastSent: lastEmailSent || new Date().toISOString()
              }
            },
            updatedAt: new Date().toISOString() 
          }
        }
        return candidate
      })
    )
  }, [])

  // Get email status for current stage
  const getEmailStatusForStage = useCallback((candidateId: number, stage: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate || !candidate.emailStatusByStage) {
      return { sent: false, lastSent: undefined }
    }
    return candidate.emailStatusByStage[stage] || { sent: false, lastSent: undefined }
  }, [candidates])

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

  // Add generic activity (used for BPCM decisions, etc.)
  const addActivity = useCallback((candidateId: number, action: string, user: string, details?: Record<string, any>) => {
    const activity: Activity = {
      id: Date.now(),
      candidateId,
      action,
      user,
      timestamp: new Date().toISOString(),
      details
    }

    setCandidates(prev =>
      prev.map(c => c.id === candidateId ? {
        ...c,
        activities: [...c.activities, activity],
        updatedAt: new Date().toISOString()
      } : c)
    )
  }, [])

  // Update candidate with BPCM reviews
  const updateCandidateBPCMReviews = useCallback((candidateId: number, bpcmReviews: any[], newStage: Candidate["stage"]) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { 
              ...candidate, 
              stage: newStage,
              bpcmReviews: [...(candidate.bpcmReviews || []), ...bpcmReviews],
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
        viTri: "DEV",
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
        donViUngTuyen: "MobifoneIT",
        hinhThuc: "Toàn thời gian",
        kinhNghiemLamViec: 3,
        lyDoLoai: "",
        donViSangLocHS: "HR Team",
        score: 0,
        status: "unsuitable",
        stage: "cv-new",
        skills: ["HTML", "CSS", "JavaScript", "React"],
        notes: "CV mới từ email",
        emailSent: false,
        lastEmailSent: undefined,
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
        ]
      },
      // CV mới 1 - Kết quả AI phù hợp
      {
        id: Date.now() + 2,
        stt: candidates.length + 2,
        nguonHoSo: "Email",
        viTri: "DEV",
        hoVaTenDem: "Trần Văn",
        ten: "Đức",
        gioiTinh: "Nam",
        namSinh: 1993,
        sdt: "0987 123 456",
        email: "tranvanduc@email.com",
        truongDaoTao: "Đại học Bách Khoa TP.HCM",
        heDaoTao: "Chính quy",
        chuyenNganh: "Công nghệ thông tin",
        loaiTotNghiep: "Giỏi",
        namTotNghiep: 2017,
        thacSy: "Có",
        khuVuc: "TP.HCM",
        donViUngTuyen: "CNC",
        hinhThuc: "Toàn thời gian",
        kinhNghiemLamViec: 6,
        lyDoLoai: "",
        donViSangLocHS: "HR Team",
        score: 87,
        status: "suitable",
        stage: "cv-new",
        skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS", "Docker"],
        notes: "CV mới từ email - Kết quả AI phù hợp",
        emailSent: false,
        lastEmailSent: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: Date.now() + 1,
            candidateId: Date.now() + 2,
            action: "CV được đồng bộ từ email",
            user: "Hệ thống",
            timestamp: new Date().toISOString(),
          },
          {
            id: Date.now() + 2,
            candidateId: Date.now() + 2,
            action: "AI hoàn thành sàng lọc tự động",
            user: "AI Agent",
            timestamp: new Date().toISOString(),
            details: { score: 87, criteria_passed: 4, criteria_failed: 1 },
          }
        ]
      },
      // CV mới 2 - Kết quả AI phù hợp
      {
        id: Date.now() + 3,
        stt: candidates.length + 3,
        nguonHoSo: "Email",
        viTri: "Data Engineer",
        hoVaTenDem: "Lê Thị",
        ten: "Mai",
        gioiTinh: "Nữ",
        namSinh: 1991,
        sdt: "0901 234 567",
        email: "lethimai@email.com",
        truongDaoTao: "Đại học Khoa học Tự nhiên",
        heDaoTao: "Chính quy",
        chuyenNganh: "Khoa học máy tính",
        loaiTotNghiep: "Xuất sắc",
        namTotNghiep: 2015,
        thacSy: "Có",
        khuVuc: "TP.HCM",
        donViUngTuyen: "MDS",
        hinhThuc: "Toàn thời gian",
        kinhNghiemLamViec: 8,
        lyDoLoai: "",
        donViSangLocHS: "HR Team",
        score: 91,
        status: "suitable",
        stage: "cv-new",
        skills: ["Python", "R", "Machine Learning", "TensorFlow", "Pandas", "SQL", "Tableau"],
        notes: "CV mới từ email - Kết quả AI phù hợp",
        emailSent: false,
        lastEmailSent: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: Date.now() + 3,
            candidateId: Date.now() + 3,
            action: "CV được đồng bộ từ email",
            user: "Hệ thống",
            timestamp: new Date().toISOString(),
          },
          {
            id: Date.now() + 4,
            candidateId: Date.now() + 3,
            action: "AI hoàn thành sàng lọc tự động",
            user: "AI Agent",
            timestamp: new Date().toISOString(),
            details: { score: 91, criteria_passed: 5, criteria_failed: 0 },
          }
        ]
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
      "bpcm-pending": 0,
      "bpcm-approved": 0,
      "bpcm-rejected": 0,
      "knowledge-test": 0,
      "interview-1": 0,
      "interview-2": 0,
      "offer": 0,
      "hired": 0,
      "rejected": 0,
      "waiting-exam-schedule": 0,
      "scheduled-exam": 0,
      "pass-test": 0,
      "fail-test": 0,
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
    updateCandidateStatus,
    updateCandidateEmailStatus,
    updateCandidateBPCMReviews,
    getEmailStatusForStage,
    addEmailActivity,
    addActivity,
    syncCVsFromEmail,
    getStageStats,
  }
}
