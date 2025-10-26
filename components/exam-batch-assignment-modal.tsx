"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ExamBatch } from "@/lib/types"
import { Calendar, MapPin, Monitor, Users } from "lucide-react"
import { useState } from "react"

interface ExamBatchAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (batchId: string) => void
  selectedCandidates: any[]
  availableBatches: ExamBatch[]
}

export function ExamBatchAssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  selectedCandidates,
  availableBatches
}: ExamBatchAssignmentModalProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("")

  const handleSubmit = () => {
    if (selectedBatchId) {
      onSubmit(selectedBatchId)
      setSelectedBatchId("")
      onClose()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "graded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Đang mở"
      case "completed":
        return "Đã thi"
      case "graded":
        return "Đã có kết quả"
      default:
        return "Không xác định"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gán ứng viên vào Đợt thi</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Selected candidates info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Ứng viên được chọn ({selectedCandidates.length})</h4>
            <div className="space-y-1">
              {selectedCandidates.slice(0, 5).map((candidate) => (
                <div key={candidate.id} className="text-sm text-muted-foreground">
                  • {candidate.hoVaTenDem} {candidate.ten} - {candidate.viTri}
                </div>
              ))}
              {selectedCandidates.length > 5 && (
                <div className="text-sm text-muted-foreground">
                  ... và {selectedCandidates.length - 5} ứng viên khác
                </div>
              )}
            </div>
          </div>

          {/* Batch selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Chọn đợt thi</label>
              <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Chọn đợt thi..." />
                </SelectTrigger>
                <SelectContent>
                  {availableBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{batch.name}</span>
                        <Badge className={`text-xs ${getStatusColor(batch.status)}`}>
                          {getStatusText(batch.status)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected batch details */}
            {selectedBatchId && (
              <div className="bg-primary/5 rounded-lg p-4">
                {(() => {
                  const batch = availableBatches.find(b => b.id === selectedBatchId)
                  if (!batch) return null
                  
                  return (
                    <div className="space-y-3">
                      <h4 className="font-medium">{batch.name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(batch.examDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {batch.format === "online" ? (
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{batch.format === "online" ? "Online" : batch.location || "Offline"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{batch.assignedCandidates}/{batch.maxCandidates} ứng viên</span>
                        </div>
                        <div>
                          <Badge className={`text-xs ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedBatchId}
            >
              Gán vào đợt thi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
