import { useCallback, useEffect, useState } from "react"
import {
  getMedicalRecords,
  type PaginationInfo,
} from "@/lib/actions/medical-record-action"
import { type TMedicalRecord } from "@/lib/definition"
import { toast } from "sonner"

export const useRecords = (limit: number) => {
  const [page, setPage] = useState(1)
  const [records, setRecords] = useState<TMedicalRecord[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMedicalRecords({ page, limit })
      if (res.success && res.data) {
        setRecords(res.data)
        setPagination(res.pagination ?? null)
      } else if (!res.success) {
        toast.error(res.message || "Failed to load medical records")
      }
    } finally {
      setLoading(false)
    }
  }, [limit, page])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { page, setPage, records, setRecords, pagination, loading, refresh }
}
