"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

interface Department {
  id: string
  name: string
  code: string
}

interface BPCMDepartmentSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (departments: Department[], note: string) => void
  candidateName: string
  candidatePosition: string
}

// Danh sách các phòng ban dựa trên hình ảnh
const DEPARTMENTS: Department[] = [
  { id: "dev1", name: "P. Phát triển phần mềm 1", code: "DEV1" },
  { id: "dev2", name: "P. Phát triển phần mềm 2", code: "DEV2" },
  { id: "dev3", name: "P. Phát triển phần mềm 3", code: "DEV3" },
  { id: "synthesis", name: "P. Tổng hợp", code: "SYN" },
  { id: "integration", name: "P. Giải pháp tích hợp", code: "INT" },
  { id: "accounting", name: "P. Kế toán", code: "ACC" },
  { id: "business", name: "P. Kinh doanh", code: "BIZ" },
  { id: "bigdata", name: "P. Big Data", code: "BD" },
  { id: "iot", name: "BU IOT", code: "IOT" },
]

export function BPCMDepartmentSelector({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  candidatePosition
}: BPCMDepartmentSelectorProps) {
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [note, setNote] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Filter departments based on search term
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return DEPARTMENTS
    return DEPARTMENTS.filter(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleDepartmentToggle = (department: Department) => {
    setSelectedDepartments(prev => {
      const isSelected = prev.find(d => d.id === department.id)
      if (isSelected) {
        return prev.filter(d => d.id !== department.id)
      } else {
        return [...prev, department]
      }
    })
    // Keep dropdown open for multiple selections
  }

  const handleInputClick = () => {
    setIsDropdownOpen(prev => !prev)
  }

  const handleRemoveDepartment = (departmentId: string) => {
    setSelectedDepartments(prev => prev.filter(d => d.id !== departmentId))
  }

  const handleSubmit = () => {
    if (selectedDepartments.length === 0) {
      return
    }
    onSubmit(selectedDepartments, note)
    handleClose()
  }

  const handleClose = () => {
    setSelectedDepartments([])
    setSearchTerm("")
    setNote("")
    setIsDropdownOpen(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gửi CV đến Bộ phận Chuyên môn</DialogTitle>
          <DialogDescription>
            Chọn các phòng ban để gửi CV duyệt. Có thể chọn nhiều phòng ban cùng lúc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin ứng viên */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-900">
                Ứng viên: {candidateName}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700">
                Vị trí: {candidatePosition}
              </span>
            </div>
          </div>

          {/* Chọn phòng ban */}
          <div className="space-y-3">
            <Label htmlFor="department-search">Chọn phòng ban</Label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={inputRef}
                  id="department-search"
                  placeholder={selectedDepartments.length > 0 
                    ? `Đã chọn ${selectedDepartments.length} phòng ban - Click để mở/đóng` 
                    : "Click để chọn phòng ban..."
                  }
                  onClick={handleInputClick}
                  className="pl-10 cursor-pointer"
                  readOnly
                />
              </div>

              {/* Dropdown danh sách phòng ban */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {/* Search input inside dropdown */}
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Tìm kiếm phòng ban..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  {filteredDepartments.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      Không tìm thấy phòng ban nào
                    </div>
                  ) : (
                    filteredDepartments.map((department) => {
                      const isSelected = selectedDepartments.find(d => d.id === department.id)
                      return (
                        <div
                          key={department.id}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleDepartmentToggle(department)}
                        >
                          <Checkbox
                            checked={!!isSelected}
                            onChange={() => handleDepartmentToggle(department)}
                            className="flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{department.name}</div>
                            <div className="text-xs text-gray-500">{department.code}</div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {/* Hiển thị các phòng ban đã chọn */}
            {selectedDepartments.length > 0 && (
              <div className="space-y-2">
                <Label>Phòng ban đã chọn ({selectedDepartments.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDepartments.map((department) => (
                    <Badge
                      key={department.id}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {department.name}
                      <button
                        onClick={() => handleRemoveDepartment(department.id)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú (Tùy chọn)</Label>
            <Textarea
              id="note"
              placeholder="Nhập ghi chú cho các phòng ban (ví dụ: Nhờ các anh/chị tập trung đánh giá kinh nghiệm về quản lý dự án)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedDepartments.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Gửi đi duyệt ({selectedDepartments.length} phòng)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
