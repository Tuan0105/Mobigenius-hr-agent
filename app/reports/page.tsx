"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useHRData } from "@/lib/data-store"
import { Calendar as CalendarIcon, Download } from "lucide-react"
import { useMemo, useState } from "react"

// Danh mục vị trí chuẩn cho báo cáo (tên + mã)
const REPORT_POSITIONS: Array<{ name: string; code: string; aliases: string[] }> = [
  { name: "An toàn thông tin", code: "ATTT", aliases: ["attt", "an toàn thông tin", "security", "information security"] },
  { name: "Lập trình viên (Developer)", code: "DEV", aliases: ["dev", "developer", "frontend", "backend", "full-stack", "fullstack", "software engineer"] },
  { name: "AI Engineer", code: "AI", aliases: ["ai", "ai engineer", "machine learning", "ml engineer", "data scientist"] },
  { name: "Lập trình viên Mobile", code: "DEV MOBILE", aliases: ["dev mobile", "mobile", "mobile developer", "android", "ios", "react native", "flutter"] },
  { name: "Nghiên cứu phát triển sản phẩm (PO)", code: "PO", aliases: ["po", "product owner", "product", "nghiên cứu phát triển sản phẩm"] },
  { name: "Data Engineer", code: "DATA", aliases: ["data", "data engineer", "data platform", "etl", "big data"] },
  { name: "UI UX Designer", code: "UI UX", aliases: ["ui/ux", "ui ux", "ux", "ui", "designer", "product designer"] },
  { name: "Phân tích nghiệp vụ (BA)", code: "BA", aliases: ["ba", "business analyst", "phân tích nghiệp vụ"] },
  { name: "Kiểm thử (Tester)", code: "TESTER", aliases: ["tester", "qa", "qa tester", "quality", "kiểm thử"] },
  { name: "Vận hành, khai thác", code: "VH", aliases: ["vận hành", "khai thác", "devops", "system", "ops", "vận hành, khai thác"] },
  { name: "Trải nghiệm khách hàng", code: "TNKH", aliases: ["trải nghiệm khách hàng", "cx", "customer", "support"] },
]

function normalizeReportPositionName(raw: string): string | null {
  const n = (raw || "").trim().toLowerCase()
  for (const rp of REPORT_POSITIONS) {
    if (rp.aliases.some(a => n.includes(a))) return rp.name
  }
  return null
}

function formatDateISO(d?: Date) {
  if (!d) return ""
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function toVNDate(d: Date) {
  return d.toLocaleDateString("vi-VN")
}

export default function ReportsPage() {
  const { allCandidates } = useHRData()

  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [department, setDepartment] = useState<string>("all")
  const [position, setPosition] = useState<string>("all")
  const [applied, setApplied] = useState(false)

  const departmentOptions = useMemo(() => {
    const s = new Set<string>()
    allCandidates.forEach(c => { if (c.donViUngTuyen) s.add(c.donViUngTuyen) })
    return Array.from(s)
  }, [allCandidates])

  const positionOptions = useMemo(() => {
    // Luôn ưu tiên danh mục chuẩn để lọc; bổ sung thêm các vị trí khác nếu có
    const base = REPORT_POSITIONS.map(p => p.name)
    const extra = new Set<string>()
    allCandidates.forEach(c => { if (c.viTri) { const k = normalizeReportPositionName(c.viTri) || c.viTri; if (!base.includes(k)) extra.add(k) } })
    return ["Tất cả", ...base, ...Array.from(extra)]
  }, [allCandidates])

  const from = fromDate ? new Date(fromDate + "T00:00:00") : undefined
  const to = toDate ? new Date(toDate + "T23:59:59") : undefined

  type Row = {
    stt: number
    viTri: string
    ma: string
    tongCV: number
    quaSangLocTong: number
    soLuongLoai: number
    nguonTopdev: number
    nguonItviec: number
    nguonVietnamworks: number
    vuotVongThiViet: number
    soLuongPhongVan: number
    trungTuyen: number
    h1: number
    h2: number
  }

  const rows: Row[] = useMemo(() => {
    // Build index theo vị trí báo cáo (đã normalize) -> candidates
    const inRange = allCandidates.filter(c => {
      const created = new Date(c.createdAt)
      if (from && created < from) return false
      if (to && created > to) return false
      if (department !== "all" && c.donViUngTuyen !== department) return false
      if (position !== "all") {
        const normalized = normalizeReportPositionName(c.viTri) || c.viTri
        if (normalized !== position) return false
      }
      return true
    })

    const byPosition = new Map<string, typeof inRange>()
    inRange.forEach(c => {
      const key = normalizeReportPositionName(c.viTri) || c.viTri || "Khác"
      const arr = byPosition.get(key) || []
      arr.push(c)
      byPosition.set(key, arr)
    })

    // Tạo báo cáo theo danh mục chuẩn để luôn hiển thị đầy đủ các vị trí (fake đủ hàng)
    const out: Row[] = []
    REPORT_POSITIONS.forEach((rp, idx) => {
      const list = byPosition.get(rp.name) || []
      const total = list.length
      const h1 = list.filter(c => c.status === "suitable" || c.status === "suitable-form1").length
      const h2 = list.filter(c => c.status === "suitable-form2").length
      const rejected = list.filter(c => c.status === "unsuitable" || c.stage === "rejected").length
      const passTest = list.filter(c => c.stage === "pass-test").length
      const interviewCount = h1 + passTest
      const hired = list.filter(c => c.stage === "hired").length
      const topdev = list.filter(c => (c.nguonHoSo || "").toLowerCase().includes("topdev")).length
      const itviec = list.filter(c => (c.nguonHoSo || "").toLowerCase().includes("itviec")).length
      const vietnamworks = list.filter(c => (c.nguonHoSo || "").toLowerCase().includes("vietnamworks")).length

      out.push({
        stt: idx + 1,
        viTri: rp.name,
        ma: rp.code,
        tongCV: total,
        quaSangLocTong: h1 + h2,
        soLuongLoai: rejected,
        nguonTopdev: topdev,
        nguonItviec: itviec,
        nguonVietnamworks: vietnamworks,
        vuotVongThiViet: passTest,
        soLuongPhongVan: interviewCount,
        trungTuyen: hired,
        h1,
        h2,
      })
    })

    return out
  }, [allCandidates, fromDate, toDate, department, position])

  const handleExport = () => {
    const header = [
      "STT",
      "Vị trí",
      "Mã",
      "Tổng CV nhận",
      "S.Lượng qua sàng lọc (Tổng)",
      "S.Lượng CV loại",
      "Nguồn Topdev",
      "Nguồn Itviec",
      "Nguồn Vietnamworks",
      "S.Lượng vượt vòng thi viết",
      "S.Lượng phỏng vấn",
      "S.Lượng trúng tuyển",
      "H1",
      "H2",
    ]
    const lines = [header.join(",")]
    rows.forEach(r => {
      lines.push([
        r.stt,
        r.viTri,
        r.ma,
        r.tongCV,
        r.quaSangLocTong,
        r.soLuongLoai,
        r.nguonTopdev,
        r.nguonItviec,
        r.nguonVietnamworks,
        r.vuotVongThiViet,
        r.soLuongPhongVan,
        r.trungTuyen,
        r.h1,
        r.h2,
      ].join(","))
    })
    const csv = lines.join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const name = `Bao_cao_tuyen_dung_${fromDate || "all"}_${toDate || "all"}.csv`
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ProtectedRoute allowedRoles={["hr"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <header className="border-b border-border bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Báo cáo Thống kê Tuyển dụng</h1>
                  <p className="text-sm text-muted-foreground mt-1">Thống kê theo khoảng thời gian, phòng ban và vị trí</p>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Từ ngày</Label>
                      <div className="relative">
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Đến ngày</Label>
                      <div className="relative">
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phòng ban</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {departmentOptions.map(dep => (
                            <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vị trí tuyển dụng</Label>
                      <Select value={position} onValueChange={setPosition}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {positionOptions.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 md:justify-end">
                      <Button onClick={() => setApplied(v => !v)}>Xem báo cáo</Button>
                      <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Xuất Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        {/* First header row: group headers */}
                        <TableRow>
                          <TableHead rowSpan={2}>STT</TableHead>
                          <TableHead rowSpan={2}>Vị trí</TableHead>
                          <TableHead rowSpan={2}>Mã</TableHead>
                          <TableHead rowSpan={2}>Tổng CV nhận</TableHead>
                          <TableHead colSpan={2} className="text-center">Số lượng CV qua sàng lọc</TableHead>
                          <TableHead rowSpan={2}>Số lượng CV loại</TableHead>
                          <TableHead colSpan={3} className="text-center">Nguồn hồ sơ</TableHead>
                          <TableHead rowSpan={2}>Vượt vòng thi viết</TableHead>
                          <TableHead rowSpan={2}>Số lượng Phỏng vấn</TableHead>
                          <TableHead rowSpan={2}>Số lượng trúng tuyển</TableHead>
                        </TableRow>
                        {/* Second header row: children */}
                        <TableRow>
                          <TableHead>H1 (PV thẳng)</TableHead>
                          <TableHead>H2 (Thi)</TableHead>
                          <TableHead>Topdev</TableHead>
                          <TableHead>Itviec</TableHead>
                          <TableHead>Vietnamworks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={13} className="text-center text-muted-foreground">Chưa có dữ liệu</TableCell>
                          </TableRow>
                        ) : (
                          rows.map(r => (
                            <TableRow key={r.ma}>
                              <TableCell>{r.stt}</TableCell>
                              <TableCell>{r.viTri}</TableCell>
                              <TableCell>{r.ma}</TableCell>
                              <TableCell>{r.tongCV}</TableCell>
                              <TableCell>{r.h1}</TableCell>
                              <TableCell>{r.h2}</TableCell>
                              <TableCell>{r.soLuongLoai}</TableCell>
                              <TableCell>{r.nguonTopdev}</TableCell>
                              <TableCell>{r.nguonItviec}</TableCell>
                              <TableCell>{r.nguonVietnamworks}</TableCell>
                              <TableCell>{r.vuotVongThiViet}</TableCell>
                              <TableCell>{r.soLuongPhongVan}</TableCell>
                              <TableCell>{r.trungTuyen}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
