"use client"

import { Sidebar } from "@/components/sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useConfigData } from "@/lib/config-store"
import {
  ArrowLeft,
  Bold,
  Edit,
  Filter,
  Italic,
  Link,
  Mail,
  Plus,
  Save,
  Trash2,
  Underline,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

// Dùng dữ liệu dùng chung từ config store

const mockCriteria = [
  { id: 1, name: "Kinh nghiệm tối thiểu", value: "3 năm", type: "hard" },
  { id: 2, name: "Trình độ học vấn", value: "Đại học", type: "hard" },
  { id: 3, name: "Kỹ năng React", value: "Bắt buộc", type: "custom" },
  { id: 4, name: "TOEIC", value: ">= 550", type: "custom" },
]

const mockEmailTemplates = [
  { id: 1, name: "Thư mời phỏng vấn", type: "interview" },
  { id: 2, name: "Thư từ chối", type: "reject" },
  { id: 3, name: "Thư gửi offer", type: "offer" },
  { id: 4, name: "Thư xác nhận nhận việc", type: "confirmation" },
]

export default function ConfigPage() {
  const router = useRouter()
  const { positions, criteria, addPosition, updatePosition, deletePosition, getCriteriaByPosition, getCommonCriteria, addCriteria, updateCriteria, deleteCriteria, emailTemplates, updateEmailTemplate } = useConfigData()
  const { toast } = useToast()
  const addFormRef = useRef<HTMLDivElement | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [modalPositionId, setModalPositionId] = useState<number | null>(null)
  const [modalName, setModalName] = useState("")
  const [modalStatus, setModalStatus] = useState<"active" | "paused">("active")
  const [activeTab, setActiveTab] = useState("positions")
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const contentRef = useRef<HTMLTextAreaElement | null>(null)

  const [newPosition, setNewPosition] = useState({ name: "", status: "active" })
  const [newCriteria, setNewCriteria] = useState({ name: "", value: "", type: "custom" })
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false)
  const [modalCriteriaId, setModalCriteriaId] = useState<number | null>(null)
  const [modalCriteriaName, setModalCriteriaName] = useState("")
  const [modalCriteriaValue, setModalCriteriaValue] = useState("")
  const [modalCriteriaType, setModalCriteriaType] = useState<"hard" | "custom">("custom")
  const [modalCriteriaEnabled, setModalCriteriaEnabled] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Cấu hình HR Agent</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quản lý vị trí tuyển dụng, tiêu chí sàng lọc và mẫu email
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="positions" className="gap-2">
                  <Users className="h-4 w-4" />
                  Vị trí tuyển dụng
                </TabsTrigger>
                <TabsTrigger value="criteria" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Tiêu chí sàng lọc
                </TabsTrigger>
                <TabsTrigger value="templates" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Mẫu Email
                </TabsTrigger>
              </TabsList>

              {/* Positions Tab */}
              <TabsContent value="positions" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Quản lý Vị trí tuyển dụng</h2>
                  <Button
                    className="gap-2"
                    onClick={() => {
                      const el = document.getElementById("add-position-form")
                      el?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm vị trí mới
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên vị trí</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Số lượng hồ sơ</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions.map((position) => (
                          <TableRow key={position.id}>
                            <TableCell className="font-medium">
                              {editingId === position.id ? (
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  placeholder="Nhập tên vị trí..."
                                />
                              ) : (
                                position.name
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={position.status === "active" ? "default" : "secondary"}>
                                {position.status === "active" ? "Đang tuyển" : "Tạm dừng"}
                              </Badge>
                            </TableCell>
                            <TableCell>{position.applications}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setModalPositionId(position.id)
                                    setModalName(position.name)
                                    setModalStatus(position.status)
                                    setIsEditModalOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xoá vị trí?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Hành động này không thể hoàn tác. Vị trí "{position.name}" sẽ bị xoá.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Huỷ</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          deletePosition(position.id)
                                          toast({ title: "Đã xoá vị trí", description: position.name })
                                        }}
                                      >
                                        Xoá
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                {/* Removed inline rename button in favor of modal */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Add New Position Form */}
                <Card ref={addFormRef} id="add-position-form">
                  <CardHeader>
                    <CardTitle>Thêm vị trí mới</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="position-name">Tên vị trí</Label>
                        <Input
                          id="position-name"
                          placeholder="Nhập tên vị trí..."
                          value={newPosition.name}
                          onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position-status">Trạng thái</Label>
                        <Select
                          value={newPosition.status}
                          onValueChange={(value) => setNewPosition({ ...newPosition, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Đang tuyển</SelectItem>
                            <SelectItem value="paused">Tạm dừng</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      className="gap-2"
                      onClick={() => {
                        if (!newPosition.name.trim()) {
                          toast({ title: "Thiếu tên vị trí", description: "Vui lòng nhập tên vị trí" })
                          return
                        }
                        addPosition({ name: newPosition.name.trim(), status: newPosition.status as any })
                        setNewPosition({ name: "", status: "active" })
                        toast({ title: "Đã thêm vị trí", description: "Vị trí mới đã được tạo" })
                      }}
                    >
                      <Save className="h-4 w-4" />
                      Lưu vị trí
                    </Button>
                  </CardContent>
                </Card>
                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa vị trí</DialogTitle>
                      <DialogDescription>Đổi tên và trạng thái vị trí tuyển dụng.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="modal-position-name">Tên vị trí</Label>
                        <Input
                          id="modal-position-name"
                          value={modalName}
                          onChange={(e) => setModalName(e.target.value)}
                          placeholder="Nhập tên vị trí..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <Select value={modalStatus} onValueChange={(v) => setModalStatus(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Đang tuyển</SelectItem>
                            <SelectItem value="paused">Tạm dừng</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                        Huỷ
                      </Button>
                      <Button
                        onClick={() => {
                          if (!modalPositionId) return
                          if (!modalName.trim()) {
                            toast({ title: "Thiếu tên vị trí", description: "Vui lòng nhập tên vị trí" })
                            return
                          }
                          updatePosition(modalPositionId, { name: modalName.trim(), status: modalStatus })
                          setIsEditModalOpen(false)
                          toast({ title: "Đã cập nhật vị trí", description: modalName.trim() })
                        }}
                      >
                        Lưu
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              {/* Criteria Tab */}
              <TabsContent value="criteria" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Quản lý Tiêu chí sàng lọc</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="position-select">Chọn vị trí tuyển dụng</Label>
                    <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vị trí..." />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.id} value={position.id.toString()}>
                            {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Tiêu chí chung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Common criteria always on top */}
                      {getCommonCriteria().map((crit) => (
                        <div key={`common-${crit.id}`} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                          <div className="flex items-center gap-3">
                            <Badge variant={crit.type === "hard" ? "default" : "secondary"}>
                              {crit.type === "hard" ? "Cứng" : "Tùy chỉnh"}
                            </Badge>
                            <div>
                              <p className="font-medium">{crit.name}</p>
                              <p className="text-sm text-muted-foreground">{crit.value}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={crit.enabled}
                              onCheckedChange={(checked) => {
                                updateCriteria(crit.id, { enabled: checked })
                                toast({ title: checked ? "Đã bật tiêu chí" : "Đã tắt tiêu chí", description: crit.name })
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Position-specific criteria */}
                      {(selectedPosition ? getCriteriaByPosition(parseInt(selectedPosition, 10)) : []).map((crit) => (
                        <div key={crit.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={crit.type === "hard" ? "default" : "secondary"}>
                              {crit.type === "hard" ? "Cứng" : "Tùy chỉnh"}
                            </Badge>
                            <div>
                              <p className="font-medium">{crit.name}</p>
                              <p className="text-sm text-muted-foreground">{crit.value}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={crit.enabled}
                              onCheckedChange={(checked) => {
                                updateCriteria(crit.id, { enabled: checked })
                                toast({ title: checked ? "Đã bật tiêu chí" : "Đã tắt tiêu chí", description: crit.name })
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setModalCriteriaId(crit.id)
                                setModalCriteriaName(crit.name)
                                setModalCriteriaValue(crit.value)
                                setModalCriteriaType(crit.type)
                                setModalCriteriaEnabled(crit.enabled)
                                setIsCriteriaModalOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {crit.type === "custom" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xoá tiêu chí?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Hành động này không thể hoàn tác. Tiêu chí "{crit.name}" sẽ bị xoá.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        deleteCriteria(crit.id)
                                        toast({ title: "Đã xoá tiêu chí", description: crit.name })
                                      }}
                                    >
                                      Xoá
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Criteria Edit Modal */}
                <Dialog open={isCriteriaModalOpen} onOpenChange={setIsCriteriaModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa tiêu chí</DialogTitle>
                      <DialogDescription>Đổi tên, giá trị, loại và trạng thái của tiêu chí.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="criteria-name">Tên tiêu chí</Label>
                        <Input id="criteria-name" value={modalCriteriaName} onChange={(e) => setModalCriteriaName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="criteria-value">Giá trị</Label>
                        <Input id="criteria-value" value={modalCriteriaValue} onChange={(e) => setModalCriteriaValue(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Loại</Label>
                        <Select value={modalCriteriaType} onValueChange={(v) => setModalCriteriaType(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hard">Cứng</SelectItem>
                            <SelectItem value="custom">Tùy chỉnh</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={modalCriteriaEnabled} onCheckedChange={setModalCriteriaEnabled} />
                        <span className="text-sm">Kích hoạt tiêu chí</span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary" onClick={() => setIsCriteriaModalOpen(false)}>Huỷ</Button>
                      <Button
                        onClick={() => {
                          if (!modalCriteriaId) return
                          if (!modalCriteriaName.trim()) {
                            toast({ title: "Thiếu tên tiêu chí", description: "Vui lòng nhập tên tiêu chí" })
                            return
                          }
                          updateCriteria(modalCriteriaId, {
                            name: modalCriteriaName.trim(),
                            value: modalCriteriaValue.trim(),
                            type: modalCriteriaType,
                            enabled: modalCriteriaEnabled,
                          })
                          setIsCriteriaModalOpen(false)
                          toast({ title: "Đã cập nhật tiêu chí", description: modalCriteriaName.trim() })
                        }}
                      >
                        Lưu
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                    <Card>
                      <CardHeader>
                        <CardTitle>Thêm tiêu chí tùy chỉnh</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="criteria-name">Tên tiêu chí</Label>
                            <Input
                              id="criteria-name"
                              placeholder="VD: Kỹ năng ReactJS"
                              value={newCriteria.name}
                              onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="criteria-value">Giá trị</Label>
                            <Input
                              id="criteria-value"
                              placeholder="VD: Bắt buộc"
                              value={newCriteria.value}
                              onChange={(e) => setNewCriteria({ ...newCriteria, value: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button
                          className="gap-2"
                          onClick={() => {
                            if (!selectedPosition) {
                              toast({ title: "Chưa chọn vị trí", description: "Hãy chọn vị trí trước khi thêm tiêu chí" })
                              return
                            }
                            if (!newCriteria.name.trim()) {
                              toast({ title: "Thiếu tên tiêu chí", description: "Vui lòng nhập tên tiêu chí" })
                              return
                            }
                            if (!newCriteria.value.trim()) {
                              toast({ title: "Thiếu giá trị", description: "Vui lòng nhập giá trị cho tiêu chí" })
                              return
                            }
                            addCriteria({
                              positionId: parseInt(selectedPosition, 10),
                              name: newCriteria.name.trim(),
                              value: newCriteria.value.trim(),
                              type: newCriteria.type as any,
                              enabled: true,
                            })
                            setNewCriteria({ name: "", value: "", type: "custom" })
                            toast({ title: "Đã thêm tiêu chí", description: "Tiêu chí mới đã được tạo" })
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Thêm tiêu chí
                        </Button>
                      </CardContent>
                </Card>
              </TabsContent>

              {/* Email Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Quản lý Mẫu Email</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Template List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Danh sách mẫu</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-1">
                        {emailTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant={selectedTemplateId === template.id ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedTemplateId(template.id)
                              setEmailSubject(template.subject)
                              setEmailContent(template.content)
                            }}
                          >
                            {template.name}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Template Editor */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-base">{emailTemplates.find(t => t.id === selectedTemplateId)?.name ?? "Chọn mẫu email"}</span>
                            <Input
                              placeholder="Tiêu đề email"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                            />
                          </div>
                          <Button
                            className="gap-2"
                            onClick={() => {
                              if (!selectedTemplateId) {
                                toast({ title: "Chưa chọn mẫu", description: "Hãy chọn mẫu email để lưu" })
                                return
                              }
                              updateEmailTemplate(selectedTemplateId, { subject: emailSubject, content: emailContent })
                              toast({ title: "Đã lưu mẫu email", description: emailTemplates.find(t => t.id === selectedTemplateId)?.name })
                            }}
                          >
                            <Save className="h-4 w-4" />
                            Lưu thay đổi
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Toolbar */}
                        <div className="flex items-center gap-2 p-2 border rounded-lg">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Underline className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Link className="h-4 w-4" />
                          </Button>
                          <div className="ml-auto">
                        <Select onValueChange={(v) => {
                          const map: Record<string, string> = {
                            name: "{{TenUngVien}}",
                            position: "{{ViTriUngTuyen}}",
                            time: "{{ThoiGianPhongVan}}",
                            company: "{{TenCongTy}}",
                          }
                          setEmailContent((prev) => prev + (prev.endsWith("\n") ? "" : "\n") + (map[v] || ""))
                        }}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Chèn trường động" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="name">{"{{TenUngVien}}"}</SelectItem>
                                <SelectItem value="position">{"{{ViTriUngTuyen}}"}</SelectItem>
                                <SelectItem value="time">{"{{ThoiGianPhongVan}}"}</SelectItem>
                                <SelectItem value="company">{"{{TenCongTy}}"}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Content Editor */}
                        <Textarea
                          ref={contentRef}
                          value={emailContent}
                          onChange={(e) => setEmailContent(e.target.value)}
                          className="min-h-96 font-mono text-sm"
                          placeholder="Nhập nội dung email..."
                        />

                        {/* Preview */}
                        <div className="space-y-2">
                          <Label>Xem trước</Label>
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <div className="whitespace-pre-wrap text-sm">{emailContent}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
