"use client"

import { useEffect, useState } from "react"
import { Download, Lock } from "lucide-react"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { Button } from "@/components/ui/button"

type ReportMetric = {
  investigation: string
  result: string
  reference?: string
  status?: string
  unit?: string
}

type ReportPatient = {
  name?: string
  age?: string
  sex?: string
  pid?: string
}

type ReportMeta = {
  module?: string
  collectedAt?: string
  referredBy?: string
}

type ReportDownloadButtonProps = {
  title: string
  filename: string
  disabled?: boolean
  className?: string
  label?: string
  patient?: ReportPatient
  meta?: ReportMeta
  metrics?: ReportMetric[]
  comments?: string[]
  findings?: string[]
  recommendations?: string[]
  notes?: string[]
}

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN_X = 32
const HEADER_HEIGHT = 76
const TOP_CONTENT_PADDING = 30
const BOTTOM_SAFE_AREA = 92
const SECTION_TITLE_HEIGHT = 22
const SECTION_BODY_LINE_HEIGHT = 15
const SECTION_BLOCK_GAP = 8

const wrapText = (
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number,
) => {
  const words = text.split(" ").filter(Boolean)
  const lines: string[] = []
  let current = ""

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    const width = font.widthOfTextAtSize(next, fontSize)
    if (width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  })

  if (current) lines.push(current)
  return lines.length ? lines : [text]
}

const buildClinicalPdf = async ({
  title,
  patient,
  meta,
  metrics = [],
  comments = [],
  findings = [],
  recommendations = [],
  notes = [],
}: Omit<ReportDownloadButtonProps, "filename" | "disabled" | "className" | "label">) => {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const generatedAt = new Date().toLocaleString("en-US")

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let cursorY = PAGE_HEIGHT - HEADER_HEIGHT - TOP_CONTENT_PADDING

  const drawHeader = () => {
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - HEADER_HEIGHT,
      width: PAGE_WIDTH,
      height: HEADER_HEIGHT,
      color: rgb(0.14, 0.18, 0.24),
    })

    page.drawText("VAIDYA DIAGNOSTIC REPORT", {
      x: MARGIN_X,
      y: PAGE_HEIGHT - 34,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    })

    page.drawText("Accurate | Caring | Instant", {
      x: MARGIN_X,
      y: PAGE_HEIGHT - 52,
      size: 10,
      font,
      color: rgb(0.82, 0.88, 0.94),
    })

    page.drawText(`Generated on ${generatedAt}`, {
      x: PAGE_WIDTH - 220,
      y: PAGE_HEIGHT - 52,
      size: 9,
      font,
      color: rgb(0.82, 0.88, 0.94),
    })
  }

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    drawHeader()
    cursorY = PAGE_HEIGHT - HEADER_HEIGHT - TOP_CONTENT_PADDING
  }

  const ensureSpace = (heightNeeded: number) => {
    if (cursorY - heightNeeded > BOTTOM_SAFE_AREA) return
    newPage()
  }

  const drawSectionTitle = (value: string) => {
    ensureSpace(SECTION_TITLE_HEIGHT + 8)
    page.drawText(value, {
      x: MARGIN_X,
      y: cursorY,
      size: 11,
      font: fontBold,
      color: rgb(0.18, 0.22, 0.3),
    })
    cursorY -= SECTION_TITLE_HEIGHT
  }

  const drawParagraphBlock = (lines: string[], bullet = false) => {
    lines.forEach((line) => {
      const wrapped = wrapText(line, font, 10, PAGE_WIDTH - MARGIN_X * 2 - (bullet ? 16 : 0))
      wrapped.forEach((segment, idx) => {
        ensureSpace(SECTION_BODY_LINE_HEIGHT)
        page.drawText(idx === 0 && bullet ? `- ${segment}` : segment, {
          x: MARGIN_X + (bullet && idx > 0 ? 10 : 0),
          y: cursorY,
          size: 10,
          font,
          color: rgb(0.26, 0.3, 0.36),
        })
        cursorY -= SECTION_BODY_LINE_HEIGHT
      })
    })
    cursorY -= SECTION_BLOCK_GAP
  }

  drawHeader()

  page.drawText(title.toUpperCase(), {
    x: MARGIN_X,
    y: cursorY,
    size: 16,
    font: fontBold,
    color: rgb(0.15, 0.18, 0.22),
  })
  cursorY -= 28

  page.drawLine({
    start: { x: MARGIN_X, y: cursorY },
    end: { x: PAGE_WIDTH - MARGIN_X, y: cursorY },
    thickness: 1,
    color: rgb(0.86, 0.88, 0.92),
  })
  cursorY -= 20

  const leftInfo = [
    ["Patient Name", patient?.name || "Member"],
    ["Age", patient?.age || "N/A"],
    ["Sex", patient?.sex || "N/A"],
    ["PID", patient?.pid || "N/A"],
  ]

  const rightInfo = [
    ["Sample Collected", meta?.collectedAt || new Date().toLocaleDateString("en-US")],
    ["Ref. By", meta?.referredBy || "Vaidya AI"],
    ["Module", meta?.module || title],
    ["Report ID", `VA-${Math.floor(Date.now() / 1000).toString().slice(-8)}`],
  ]

  const infoHeight = 112
  ensureSpace(infoHeight + 20)
  const halfWidth = (PAGE_WIDTH - MARGIN_X * 2 - 12) / 2
  page.drawRectangle({
    x: MARGIN_X,
    y: cursorY - infoHeight,
    width: halfWidth,
    height: infoHeight,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.86, 0.88, 0.92),
    borderWidth: 1,
  })
  page.drawRectangle({
    x: MARGIN_X + halfWidth + 12,
    y: cursorY - infoHeight,
    width: halfWidth,
    height: infoHeight,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.86, 0.88, 0.92),
    borderWidth: 1,
  })

  let leftY = cursorY - 20
  leftInfo.forEach(([label, value]) => {
    page.drawText(`${label}:`, {
      x: MARGIN_X + 10,
      y: leftY,
      size: 9,
      font: fontBold,
      color: rgb(0.24, 0.28, 0.33),
    })
    page.drawText(value, {
      x: MARGIN_X + 96,
      y: leftY,
      size: 9,
      font,
      color: rgb(0.24, 0.28, 0.33),
    })
    leftY -= 22
  })

  let rightY = cursorY - 20
  rightInfo.forEach(([label, value]) => {
    page.drawText(`${label}:`, {
      x: MARGIN_X + halfWidth + 22,
      y: rightY,
      size: 9,
      font: fontBold,
      color: rgb(0.24, 0.28, 0.33),
    })
    page.drawText(value, {
      x: MARGIN_X + halfWidth + 112,
      y: rightY,
      size: 9,
      font,
      color: rgb(0.24, 0.28, 0.33),
    })
    rightY -= 22
  })
  cursorY -= infoHeight + 24

  drawSectionTitle("Investigation Summary")

  const normalizedMetrics = metrics.length
    ? metrics
    : [{ investigation: "No investigations supplied", result: "N/A", reference: "N/A", status: "Info", unit: "-" }]

  const tableHeaders = ["Investigation", "Result", "Reference", "Status", "Unit"]
  const tableWidths = [188, 96, 96, 96, 72]
  const rowHeight = 24

  ensureSpace(rowHeight * (normalizedMetrics.length + 2) + 12)

  let tableY = cursorY
  let x = MARGIN_X
  tableHeaders.forEach((header, idx) => {
    const width = tableWidths[idx]
    page.drawRectangle({
      x,
      y: tableY - rowHeight,
      width,
      height: rowHeight,
      color: rgb(0.91, 0.93, 0.96),
      borderColor: rgb(0.82, 0.85, 0.9),
      borderWidth: 1,
    })
    page.drawText(header, {
      x: x + 6,
      y: tableY - 15,
      size: 9,
      font: fontBold,
      color: rgb(0.22, 0.26, 0.33),
    })
    x += width
  })

  tableY -= rowHeight
  normalizedMetrics.forEach((metric) => {
    ensureSpace(rowHeight + 8)
    const values = [
      metric.investigation || "N/A",
      metric.result || "N/A",
      metric.reference || "N/A",
      metric.status || "Info",
      metric.unit || "-",
    ]

    let colX = MARGIN_X
    values.forEach((value, idx) => {
      const width = tableWidths[idx]
      page.drawRectangle({
        x: colX,
        y: tableY - rowHeight,
        width,
        height: rowHeight,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.88, 0.9, 0.93),
        borderWidth: 1,
      })

      const clipped = value.length > 34 ? `${value.slice(0, 31)}...` : value
      page.drawText(clipped, {
        x: colX + 6,
        y: tableY - 15,
        size: 8.5,
        font,
        color: rgb(0.24, 0.28, 0.34),
      })
      colX += width
    })
    tableY -= rowHeight
    cursorY = tableY
  })
  cursorY -= 16

  drawSectionTitle("Clinical Comments")
  drawParagraphBlock(
    comments.length ? comments : ["No additional comments supplied."],
  )

  drawSectionTitle("AI Findings")
  drawParagraphBlock(
    findings.length ? findings : ["No findings available."],
    true,
  )

  drawSectionTitle("Recommendations")
  drawParagraphBlock(
    recommendations.length ? recommendations : ["No recommendations available."],
    true,
  )

  if (notes.length) {
    drawSectionTitle("Additional Notes")
    drawParagraphBlock(notes)
  }

  ensureSpace(64)
  const signY = Math.max(cursorY - 8, BOTTOM_SAFE_AREA + 20)
  const signColumns = ["Medical Lab Technician", "Pathologist", "Consultant"]
  const signWidth = (PAGE_WIDTH - MARGIN_X * 2) / 3
  signColumns.forEach((name, idx) => {
    const left = MARGIN_X + idx * signWidth
    page.drawLine({
      start: { x: left + 8, y: signY + 16 },
      end: { x: left + signWidth - 8, y: signY + 16 },
      thickness: 0.7,
      color: rgb(0.75, 0.78, 0.82),
    })
    page.drawText(name, {
      x: left + 12,
      y: signY,
      size: 8.5,
      font: fontBold,
      color: rgb(0.24, 0.28, 0.34),
    })
  })

  const pages = pdfDoc.getPages()
  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: MARGIN_X, y: 40 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: 40 },
      thickness: 0.7,
      color: rgb(0.86, 0.88, 0.92),
    })
    pdfPage.drawText(`Generated on: ${generatedAt}`, {
      x: MARGIN_X,
      y: 26,
      size: 8,
      font,
      color: rgb(0.46, 0.5, 0.57),
    })
    pdfPage.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: PAGE_WIDTH - 92,
      y: 26,
      size: 8,
      font,
      color: rgb(0.46, 0.5, 0.57),
    })
  })

  return pdfDoc.save()
}

export function ReportDownloadButton({
  title,
  filename,
  disabled,
  className,
  label,
  patient,
  meta,
  metrics,
  comments,
  findings,
  recommendations,
  notes,
}: ReportDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [checkingPremium, setCheckingPremium] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchPremiumStatus = async () => {
      try {
        const response = await fetch("/api/premium", {
          method: "GET",
          cache: "no-store",
        })
        const payload = await response.json().catch(() => ({}))
        if (!mounted) return
        setIsPremium(Boolean(payload?.data?.isPremium))
      } catch {
        if (!mounted) return
        setIsPremium(false)
      } finally {
        if (mounted) setCheckingPremium(false)
      }
    }

    fetchPremiumStatus()
    return () => {
      mounted = false
    }
  }, [])

  const handleDownload = async () => {
    if (disabled || downloading) return
    setDownloading(true)
    try {
      const pdfBytes = await buildClinicalPdf({
        title,
        patient,
        meta,
        metrics,
        comments,
        findings,
        recommendations,
        notes,
      })
      const pdfArrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength,
      ) as ArrayBuffer
      const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const handleUpgrade = async () => {
    if (upgrading) return
    setUpgrading(true)
    setPaymentMessage(null)
    try {
      const response = await fetch("/api/premium", {
        method: "POST",
        cache: "no-store",
      })
      const payload = await response.json().catch(() => ({}))
      const checkoutUrl = payload?.data?.checkoutUrl
      if (response.ok && payload?.success && checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        setPaymentMessage(payload?.message || "Failed to start Stripe checkout.")
      }
    } catch {
      setPaymentMessage("Failed to start Stripe checkout.")
    } finally {
      setUpgrading(false)
    }
  }

  const handleAction = async () => {
    if (checkingPremium || disabled) return
    if (isPremium) {
      await handleDownload()
      return
    }
    await handleUpgrade()
  }

  const buttonLabel = checkingPremium
    ? "Checking access..."
    : isPremium
      ? (downloading ? "Generating report..." : (label ?? "Download report PDF"))
      : (upgrading ? "Redirecting to Stripe..." : "Unlock PDF download")

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className={className ?? "rounded-full"}
        onClick={handleAction}
        disabled={disabled || checkingPremium || downloading || upgrading}
      >
        {isPremium ? (
          <Download className="mr-2 h-4 w-4" />
        ) : (
          <Lock className="mr-2 h-4 w-4" />
        )}
        {buttonLabel}
      </Button>
      {!checkingPremium && !isPremium ? (
        <p className="text-xs text-muted-foreground">
          Premium access is required for PDF download.
        </p>
      ) : null}
      {paymentMessage ? (
        <p className="text-xs text-muted-foreground">{paymentMessage}</p>
      ) : null}
    </div>
  )
}

