"use client"

import { useCallback, useState } from "react"
import type { Activity, Candidate, FilterState } from "./types"

// Mock initial data với đầy đủ thông tin
const initialCandidates: Candidate[] = [
  {
    id: 1,
    stt: 1,
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
    ],
  },
  {
    id: 2,
    stt: 2,
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
  },
  {
    id: 3,
    stt: 3,
    nguonHoSo: "Website công ty",
    viTri: "UI UX",
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
        action: "Gửi thư chúc mừng trúng tuyển",
        user: "HR Manager",
        timestamp: "2025-09-29T11:00:00Z",
      },
    ],
  },
  {
    id: 4,
    stt: 4,
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
  },
  {
    id: 5,
    stt: 5,
    nguonHoSo: "Website tuyển dụng",
    viTri: "Tester",
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
  },
  {
    id: 6,
    stt: 6,
    nguonHoSo: "Website tuyển dụng",
    viTri: "UI UX",
    hoVaTenDem: "Trần Thị",
    ten: "Tuyết",
    gioiTinh: "Nữ",
    namSinh: 1994,
    sdt: "0741 852 963",
    email: "tranthituyet@email.com",
    truongDaoTao: "Đại học Mỹ thuật",
    heDaoTao: "Chính quy",
    chuyenNganh: "Thiết kế đồ họa",
    loaiTotNghiep: "Giỏi",
    namTotNghiep: 2018,
    thacSy: "Không",
    khuVuc: "Hà Nội",
    donViUngTuyen: "CNC",
    hinhThuc: "Toàn thời gian",
    kinhNghiemLamViec: 6,
    lyDoLoai: "",
    donViSangLocHS: "HR Team",
    score: 45,
    status: "unsuitable",
    stage: "cv-new",
    skills: ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"],
    notes: "Designer có kinh nghiệm tốt với UI/UX",
    emailSent: false,
    lastEmailSent: undefined,
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
  },
  // Additional 10 CVs for testing
  {
    id: 7,
    stt: 7,
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
    createdAt: "2025-09-30T09:00:00Z",
    updatedAt: "2025-09-30T09:00:00Z",
    activities: [
      {
        id: 11,
        candidateId: 7,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T09:00:00Z",
      },
    ],
  },
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
        id: 12,
        candidateId: 8,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T08:15:00Z",
      },
      {
        id: 13,
        candidateId: 8,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T08:20:00Z",
        details: { score: 82, criteria_passed: 4, criteria_failed: 1 },
      },
      {
        id: 14,
        candidateId: 8,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T10:30:00Z",
      },
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
        id: 15,
        candidateId: 9,
        action: "CV được tải lên hệ thống",
        user: "Hệ thống",
        timestamp: "2025-09-30T07:30:00Z",
      },
      {
        id: 16,
        candidateId: 9,
        action: "AI hoàn thành sàng lọc tự động",
        user: "AI Agent",
        timestamp: "2025-09-30T07:35:00Z",
        details: { score: 91, criteria_passed: 5, criteria_failed: 0 },
      },
      {
        id: 17,
        candidateId: 9,
        action: "Gửi thư mời thi kiến thức, kỹ năng",
        user: "HR Manager",
        timestamp: "2025-09-30T10:00:00Z",
      },
      {
        id: 18,
        candidateId: 9,
        action: "Gửi thư mời phỏng vấn vòng 1",
        user: "HR Manager",
        timestamp: "2025-09-30T11:45:00Z",
      },
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
    ],
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
      "knowledge-test": 0,
      "interview-1": 0,
      "interview-2": 0,
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
    updateCandidateStatus,
    updateCandidateEmailStatus,
    getEmailStatusForStage,
    addEmailActivity,
    syncCVsFromEmail,
    getStageStats,
  }
}
