"use client"

import { CandidateDetailModal } from "@/components/candidate-detail-modal"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { useHRData } from "@/lib/data-store"
import type { Candidate } from "@/lib/types"
import { Calendar, Clock, Ellipsis, Send, User, Users } from "lucide-react"
import { useConfigData } from "@/lib/config-store"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type InterviewEvent = {
  id: string
  candidate: Candidate
  date: Date
  time?: string
  round: "interview-1" | "interview-2"
  interviewers?: string[]
  status: "confirmed" | "pending" | "rejected"
}

function parseInterviewFromCandidate(c: Candidate): InterviewEvent[] {
  const events: InterviewEvent[] = []
  // Prefer schedule string if present
  if (c.schedule) {
    const match = c.schedule.match(/(PV\sV1|PV\sV2):\s(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (match) {
      const round = match[1] === "PV V1" ? "interview-1" : "interview-2"
      const day = parseInt(match[2]); const month = parseInt(match[3]); const year = parseInt(match[4])
      const date = new Date(year, month - 1, day)
      events.push({
        id: `${c.id}-${round}`,
        candidate: c,
        date,
        time: undefined,
        round,
        interviewers: [],
        status: (c.interviewResult === "rejected") ? "rejected" : (c.interviewResult === "passed") ? "confirmed" : "pending",
      })
    }
  }
  // Additionally, infer from activities if have interviewDate/time saved
  (c.activities || []).forEach((act: any, idx: number) => {
    const d = act?.details
    if (d?.interviewDate) {
      const date = new Date(d.interviewDate)
      const time = d.interviewTime
      const round: "interview-1" | "interview-2" = act?.details?.templateType === "interview-round-2" || c.stage === "interview-2" ? "interview-2" : "interview-1"
      events.push({
        id: `${c.id}-act-${idx}`,
        candidate: c,
        date,
        time,
        round,
        interviewers: d?.interviewers || [],
        status: (c.interviewResult === "rejected") ? "rejected" : (c.interviewResult === "passed") ? "confirmed" : "pending",
      })
    }
  })
  return events
}

export default function InterviewsPage() {
  const { candidates } = useHRData()
  const { councils, positions, getCouncilsByPosition } = useConfigData()
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const router = useRouter()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  // State chỉnh sửa giờ và ngày cho từng event theo id
  const [editedEvents, setEditedEvents] = useState<Record<string, {time?: string, date?: string}>>({});
  // Danh sách event đang hiển thị (sau khi có thể đã xóa bằng hủy lịch)
  const [activeEventIds, setActiveEventIds] = useState<string[] | null>(null)
  // Popup xác nhận xóa eventId
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  // Popup gửi lịch cho hội đồng
  const [sendCouncilId, setSendCouncilId] = useState<number | null>(null)

    // Bộ lọc vị trí tuyển dụng
  const [positionFilter, setPositionFilter] = useState("");
  const positionList = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach(c => { if (c.viTri) set.add(c.viTri) });
    return Array.from(set);
  }, [candidates]);

  // Tìm kiếm theo tên ứng viên
  const [searchQuery, setSearchQuery] = useState("")

  // Simple events calculation - no useMemo to avoid loops
  const baseEvents: InterviewEvent[] = []
    candidates.forEach((c) => {
    baseEvents.push(...parseInterviewFromCandidate(c))
    })

  // Fake events to showcase the interface more fully
  const fakeEvents: InterviewEvent[] = []
  if (candidates && candidates.length > 0) {
    const pick = (idx: number) => candidates[idx % Math.max(1, candidates.length)]
    const today = new Date()
    const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const d1 = new Date(d0); d1.setDate(d0.getDate() + 1)
    const d2 = new Date(d0); d2.setDate(d0.getDate() + 2)

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    const build = (id: string, day: Date, hour: number, minute: number, round: "interview-1" | "interview-2", interviewerNames: string[], status: InterviewEvent["status"], candIdx: number) => {
      return {
        id,
        candidate: pick(candIdx),
        date: new Date(day),
        time: `${pad(hour)}:${pad(minute)}`,
        round,
        interviewers: interviewerNames,
        status,
      } as InterviewEvent
    }

    fakeEvents.push(build("fake-1", d0, 9, 0, "interview-1", ["Trần B (Trưởng phòng IT)", "Lê C (HR)"], "pending", 0))
    fakeEvents.push(build("fake-2", d0, 10, 30, "interview-1", ["Nguyễn D (Tech Lead)"], "confirmed", 1))
    fakeEvents.push(build("fake-3", d0, 14, 0, "interview-2", ["Phạm E (Manager)", "Lê C (HR)"], "rejected", 2))
    fakeEvents.push(build("fake-4", d1, 9, 30, "interview-1", ["Trần B (Trưởng phòng IT)"], "pending", 3))
    fakeEvents.push(build("fake-5", d1, 11, 0, "interview-2", ["Nguyễn D (Tech Lead)", "Lê C (HR)"], "confirmed", 4))
    fakeEvents.push(build("fake-6", d2, 15, 0, "interview-1", ["Phạm E (Manager)"], "pending", 5))
  }

  const allEvents = [...baseEvents, ...fakeEvents]

    // Mốc ngày hôm nay và danh sách event chưa diễn ra, lọc theo vị trí
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

const futureEvents = useMemo(() => {
  const source = activeEventIds === null ? allEvents : allEvents.filter(ev => activeEventIds.includes(ev.id));

  const q = (searchQuery || "").trim().toLowerCase();

  return source
    .filter(e => {
      const edit = editedEvents[e.id];
      let d = e.date;
      if (edit?.date) d = new Date(edit.date);

      // Lọc theo tên nếu có searchQuery
      if (q.length > 0) {
        const fullName = `${e.candidate?.hoVaTenDem || ""} ${e.candidate?.ten || ""}`.toLowerCase().trim();
        if (!fullName.includes(q)) return false;
      }

      // Lọc theo vị trí nếu có
      if (positionFilter && e.candidate.viTri !== positionFilter) return false;

      // Lọc theo ngày nếu đang chọn ngày
      if (selectedDate !== null) {
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      }

      // Nếu không chọn ngày nhưng có vị trí hoặc đang tìm kiếm tên => hiển thị từ hôm nay trở đi
      if (positionFilter || q.length > 0) {
        return d >= today;
      }

      // Mặc định: nếu không có gì, cũng trả về theo hôm nay trở đi (phòng trường hợp selectedDate = null)
      return d >= today;
    })
    .sort((a, b) => {
      const getDate = (ev: any) => {
        const edit = editedEvents[ev.id];
        let d = ev.date;
        if (edit?.date) d = new Date(edit.date);
        return d;
      };
      const da = getDate(a).getTime();
      const db = getDate(b).getTime();
      if (da !== db) return da - db;
      const ta = editedEvents[a.id]?.time || a.time || "23:59";
      const tb = editedEvents[b.id]?.time || b.time || "23:59";
      return ta.localeCompare(tb);
    });
}, [allEvents, activeEventIds, positionFilter, today, selectedDate, editedEvents, searchQuery]);

  // Hiển thị events sau khi đã (có thể) xóa (bằng "hủy lịch")
  const effectiveEvents = activeEventIds === null ? allEvents : allEvents.filter(ev => activeEventIds.includes(ev.id))

  // Group events by day
  const eventsByDay = new Map<string, InterviewEvent[]>()
  effectiveEvents.forEach((e) => {
    // lấy thông tin ngày sửa thủ công nếu có
    const edit = editedEvents[e.id]
    let displayDate = e.date
    if (edit?.date) displayDate = new Date(edit.date)
    const key = new Date(displayDate.getFullYear(), displayDate.getMonth(), displayDate.getDate()).toISOString()
    const arr = eventsByDay.get(key) || []
      arr.push(e)
    eventsByDay.set(key, arr)
    })

  const selectedKey = new Date(selectedDate?.getFullYear() || 0, selectedDate?.getMonth() || 0, selectedDate?.getDate() || 0).toISOString()
  const dayEvents = (eventsByDay.get(selectedKey) || []).sort((a, b) => {
    const ta = editedEvents[a.id]?.time || a.time || "23:59"
    const tb = editedEvents[b.id]?.time || b.time || "23:59"
    return ta.localeCompare(tb)
  })

  // Helper: determine council for an event (by candidate assignment or suggestion by position)
  const resolveCouncilForEvent = (ev: InterviewEvent) => {
    const assignedId = ev.candidate?.interviewCouncilId
    if (assignedId) {
      return councils.find(c => c.id === assignedId) || null
    }
    // Suggest by candidate position
    const pos = positions.find(p => p.name === ev.candidate?.viTri)
    if (!pos) return null
    const list = getCouncilsByPosition(pos.id)
    return list[0] || null
  }

  // Group day events by council
  const groups = useMemo(() => {
    const map = new Map<string, { council: any | null; events: InterviewEvent[] }>()
    dayEvents.forEach(ev => {
      const council = resolveCouncilForEvent(ev)
      const key = council ? `council-${council.id}` : "uncategorized"
      const entry = map.get(key) || { council, events: [] as InterviewEvent[] }
      entry.events.push(ev)
      map.set(key, entry)
    })
    return Array.from(map.values())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayEvents, councils, positions])

  // Actions
  const handleViewCandidate = (c: Candidate) => {
      setSelectedCandidate(c)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCandidate(null)
  }

  const handleResendEmail = (ev: InterviewEvent) => {
    toast({ title: "Đã gửi lại email xác nhận", description: `${ev.candidate.hoVaTenDem} ${ev.candidate.ten}` })
  }

  const handleCancelInterview = (ev: InterviewEvent) => {
    toast({ title: "Đã hủy lịch phỏng vấn", description: `${ev.candidate.hoVaTenDem} ${ev.candidate.ten}` })
  }

  // Xử lý thay đổi giờ/ngày của event
  const handleEditTime = (id: string, value: string) => {
    setEditedEvents(prev => ({ ...prev, [id]: { ...(prev[id] || {}), time: value } }))
  }
  const handleEditDate = (id: string, value: string) => {
    setEditedEvents(prev => ({ ...prev, [id]: { ...(prev[id] || {}), date: value } }))
  }

  // Hủy lịch -> mở confirm popup
  const handleCancelPopup = (ev: InterviewEvent) => {
    setOpenMenuId(null)
    setConfirmDeleteId(ev.id)
  }
  // Thực sự xóa khỏi lịch
  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      const newIds = (activeEventIds === null
        ? allEvents.map(e => e.id)
        : activeEventIds.slice()
      ).filter(id => id !== confirmDeleteId)
      setActiveEventIds(newIds)
      setConfirmDeleteId(null)
      toast({ title: "Đã hủy lịch phỏng vấn" })
    }
  }
  const handleCancelDelete = () => {
    setConfirmDeleteId(null)
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
                  <h1 className="text-2xl font-bold text-foreground">Quản lý Phỏng vấn</h1>
                  <p className="text-sm text-muted-foreground mt-1">Theo dõi và điều phối lịch phỏng vấn theo ngày</p>
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-hidden p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {/* Left: Date selector */}
                <div className="md:col-span-1 border rounded-lg p-4 bg-card h-fit">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-semibold">Chọn ngày</h2>
                  </div>
                  {/* Bộ lọc vị trí */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1 text-muted-foreground" htmlFor="position-filter">Lọc theo vị trí</label>
                    <select
                      id="position-filter"
                      className="border rounded px-2 py-1 text-sm w-full"
                      value={positionFilter}
                      onChange={e => {
                        const pos = e.target.value;
                        setPositionFilter(pos);
                        if (pos) {
                          setSelectedDate(null); // Reset ngày khi lọc vị trí
                        } else {
                          setSelectedDate(new Date()); // Khi bỏ lọc, mặc định chọn lại hôm nay
                        }
                      }}
                    >
                      <option value="">Tất cả vị trí</option>
                      {positionList.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                  </div>

                  {/* Tìm kiếm theo tên */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1 text-muted-foreground" htmlFor="candidate-search">Tìm theo tên ứng viên</label>
                    <input
                      id="candidate-search"
                      type="text"
                      className="border rounded px-2 py-1 text-sm w-full"
                      placeholder="Nhập tên ứng viên..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(d) => setSelectedDate(d ?? null)}
                    showOutsideDays
                    className="rounded-md"
                  />
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tổng số lịch</span>
                      <Badge variant="secondary">{dayEvents.length}</Badge>
                    </div>
                  </div>
                </div>

                {/* Right: Agenda */}
                <div className="md:col-span-2 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
  Lịch phỏng vấn:{" "}
  {selectedDate && (
    selectedDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  )}
  {positionFilter && positionFilter !== "" && (
    <> – <span className="text-primary font-bold">{positionFilter}</span></>
  )}
                    </h2>
                  </div>
                  {dayEvents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border rounded-lg">
                      Không có lịch phỏng vấn trong ngày
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto space-y-6 pr-1">
                      {groups.map((g, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                              {g.council ? `HĐPV ${g.council.name}` : "Chưa gán Hội đồng"} ({g.events.length} ứng viên)
                            </h3>
                            {g.council && (
                              <Button size="sm" className="gap-2" onClick={() => setSendCouncilId(g.council.id)}>
                                <Send className="h-4 w-4" /> Gửi Lịch cho HĐPV {g.council.name}
                              </Button>
                            )}
                          </div>
                          {g.events.map(e => (
                            <Card key={e.id} className="border-border relative">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <input type="time" className="border rounded px-2 py-1 mr-2 outline-0 focus:outline-primary text-sm w-[86px]" value={editedEvents[e.id]?.time || e.time || ""} onChange={ev => handleEditTime(e.id, ev.target.value)} onBlur={ev => handleEditTime(e.id, ev.target.value)} onKeyDown={ev => { if(ev.key==="Enter"){(ev.target as HTMLInputElement).blur()}}} />
                                      <input type="date" className="border rounded px-2 py-1 mr-2 outline-0 focus:outline-primary text-sm w-[138px]" value={editedEvents[e.id]?.date || (e.date ? e.date.toISOString().slice(0,10) : "")} onChange={ev => handleEditDate(e.id, ev.target.value)} onBlur={ev => handleEditDate(e.id, ev.target.value)} onKeyDown={ev => { if(ev.key==="Enter"){(ev.target as HTMLInputElement).blur()}}} />
                                      <Badge variant="outline">{e.round === "interview-1" ? "Vòng 1" : "Vòng 2"}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <button className="font-medium hover:underline" onClick={() => handleViewCandidate(e.candidate)}>
                                        {e.candidate?.hoVaTenDem} {e.candidate?.ten}
                                      </button>
                                      <span className="text-muted-foreground">• {e.candidate?.viTri}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">Người phỏng vấn:</span>
                                      <span className="font-medium">{e.interviewers?.length ? e.interviewers.join(", ") : "Chưa phân công"}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" title="Hành động" onClick={() => setOpenMenuId(openMenuId === e.id ? null : e.id)} aria-haspopup="menu" aria-expanded={openMenuId === e.id}>
                                      <Ellipsis className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {openMenuId === e.id && (
                                  <>
                                    <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
                                    <div className="absolute right-3 top-12 z-[9999] w-56 rounded-md border bg-popover text-popover-foreground shadow-md p-1">
                                      <button type="button" className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent" onClick={() => { setOpenMenuId(null); handleViewCandidate(e.candidate) }}>Xem chi tiết hồ sơ</button>
                                      <button type="button" className="w-full text-left px-2 py-1.5 text-sm rounded-sm text-destructive hover:bg-accent" onClick={() => handleCancelPopup(e)}>Hủy lịch</button>
                                    </div>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSendEmail={() => {}}
          onNotesUpdate={() => {}}
          onStatusUpdate={() => {}}
          onStageUpdate={() => {}}
          onScheduleUpdate={() => {}}
          onInterviewResultUpdate={() => {}}
          allCandidates={candidates}
          onEmailStatusUpdate={() => {}}
        />
      )}
      {/* POPUP XÁC NHẬN HỦY LỊCH */}
      {confirmDeleteId && (
        <>
          <div className="fixed inset-0 z-[99998] bg-black/60" onClick={handleCancelDelete}/>
          <div className="fixed z-[99999] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 min-w-[320px] border">
            <div className="mb-4 text-base font-semibold">Xác nhận hủy lịch phỏng vấn?</div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancelDelete}>Huỷ</Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>Xác nhận xoá</Button>
            </div>
          </div>
        </>
      )}

      {/* POPUP GỬI LỊCH CHO HỘI ĐỒNG */}
      {sendCouncilId && (
        (() => {
          const council = councils.find(c => c.id === sendCouncilId)
          const councilEvents = dayEvents.filter(ev => (resolveCouncilForEvent(ev)?.id || 0) === sendCouncilId)
          return (
            <>
              <div className="fixed inset-0 z-[99998] bg-black/60" onClick={() => setSendCouncilId(null)} />
              <div className="fixed z-[99999] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 min-w-[520px] border max-w-[90vw]">
                <div className="mb-2 text-base font-semibold">Gửi lịch cho {council?.name}</div>
                <div className="text-sm text-muted-foreground mb-3">{councilEvents.length} ứng viên sẽ nhận trong email</div>
                <div className="max-h-[300px] overflow-auto border rounded">
                  {councilEvents.map(ev => (
                    <div key={ev.id} className="px-3 py-2 border-b text-sm flex items-center gap-2">
                      <span className="min-w-[120px]">{(editedEvents[ev.id]?.time || ev.time || "").padEnd(5)}</span>
                      <span className="font-medium">{ev.candidate.hoVaTenDem} {ev.candidate.ten}</span>
                      <span className="text-muted-foreground">• {ev.candidate.viTri}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" onClick={() => setSendCouncilId(null)}>Đóng</Button>
                  <Button onClick={() => { toast({ title: "Đã chuẩn bị email và file đính kèm", description: `Gửi tới ${council?.members.length || 0} thành viên của ${council?.name}` }); setSendCouncilId(null) }}>Gửi</Button>
                </div>
              </div>
            </>
          )
        })()
      )}
    </ProtectedRoute>
  )
}