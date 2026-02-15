import { categoryAliases, recordTypes } from "./options"

export const normalizeCategoryLabel = (value?: string) => {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  const lowered = trimmed.toLowerCase()
  if (categoryAliases[lowered]) return categoryAliases[lowered]
  const match = recordTypes.find((item) => item.toLowerCase() === lowered)
  return match ?? trimmed
}

export const parseDate = (value?: string | Date) => {
  if (!value) return null
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export const todayISO = () => new Date().toISOString().slice(0, 10)
export const todayLocalISO = () => new Date().toLocaleDateString("en-CA")

export const formatDate = (value?: string) => {
  if (!value) return "N/A"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "N/A"
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

export const parseNumberField = (value?: string) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const parseSymptomList = (value?: string) => {
  if (!value) return undefined
  const list = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  return list.length ? list : undefined
}

export const formatStructuredValue = (value: unknown) => {
  if (Array.isArray(value)) return value.join(", ")
  if (value === null || value === undefined) return ""
  return String(value)
}

export const formatFileSize = (value?: number) => {
  if (!value || value <= 0) return "Unknown size"
  const mb = value / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  const kb = value / 1024
  return `${Math.max(1, Math.round(kb))} KB`
}

export const isPdfAttachment = (attachment?: { type?: string; url?: string }) => {
  const type = attachment?.type ?? ""
  const url = attachment?.url ?? ""
  return type === "application/pdf" || /\.pdf($|\?)/i.test(url)
}

export const isImageAttachment = (attachment?: { type?: string; url?: string }) => {
  const type = attachment?.type ?? ""
  const url = attachment?.url ?? ""
  return type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(url)
}

export const buildCloudinaryPdfPreviewUrl = (url?: string) => {
  if (!url || !/res\.cloudinary\.com/i.test(url)) return null
  if (!/\.pdf($|\?)/i.test(url)) return null
  if (!url.includes("/image/upload/")) return null
  return url
    .replace("/upload/", "/upload/pg_1,f_jpg/")
    .replace(/\.pdf($|\?)/i, ".jpg$1")
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/v1/api"

export const buildFileProxyUrl = (url: string, download = false, name?: string) => {
  const params = new URLSearchParams({ url })
  if (download) params.set("download", "1")
  if (name) params.set("name", name)
  return `${API_BASE_URL}/files?${params.toString()}`
}

export const downloadUrl = async (url: string, name?: string) => {
  const proxyUrl = buildFileProxyUrl(url, true, name)
  try {
    const response = await fetch(proxyUrl, { credentials: "include" })
    if (!response.ok) throw new Error("Download failed")
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = name || "attachment"
    link.rel = "noopener"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  } catch {
    window.open(proxyUrl, "_blank", "noopener,noreferrer")
  }
}
