"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { BPCMReview } from "@/lib/types"
import { Check, Clock, X } from "lucide-react"

interface BPCMReviewStatusProps {
  reviews: BPCMReview[]
}

export function BPCMReviewStatus({ reviews }: BPCMReviewStatusProps) {
  if (!reviews || reviews.length === 0) {
    return <span className="text-gray-400 text-sm">Chưa gửi</span>
  }

  const approvedCount = reviews.filter(r => r.status === "approved").length
  const rejectedCount = reviews.filter(r => r.status === "rejected").length
  const pendingCount = reviews.filter(r => r.status === "pending").length
  const totalCount = reviews.length

  // Tạo text hiển thị tổng hợp
  const getStatusText = () => {
    if (pendingCount === totalCount) {
      return `${totalCount} phòng đang chờ`
    }
    if (approvedCount > 0 && rejectedCount === 0 && pendingCount === 0) {
      return `${approvedCount}/${totalCount} ✓ Đồng ý`
    }
    if (rejectedCount > 0 && approvedCount === 0 && pendingCount === 0) {
      return `${rejectedCount}/${totalCount} ✗ Từ chối`
    }
    return `${approvedCount}/${totalCount} ✓ Đồng ý`
  }

  // Tạo chi tiết cho tooltip
  const getTooltipContent = () => {
    return (
      <div className="space-y-2">
        <div className="font-medium text-sm mb-2">Chi tiết kết quả duyệt:</div>
        {reviews.map((review) => (
          <div key={review.id} className="flex items-center justify-between text-xs gap-4">
            <span className="font-medium">{review.departmentName}</span>
            <div className="flex items-center gap-1 ml-2">
              {review.status === "approved" && (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Đã đồng ý</span>
                </>
              )}
              {review.status === "rejected" && (
                <>
                  <X className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">Đã từ chối</span>
                </>
              )}
              {review.status === "pending" && (
                <>
                  <Clock className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-600">Chờ duyệt</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer">
            <Badge 
              variant="default"
              className="text-xs"
            >
              {getStatusText()}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-white text-slate-900 border border-slate-200 shadow-md">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
