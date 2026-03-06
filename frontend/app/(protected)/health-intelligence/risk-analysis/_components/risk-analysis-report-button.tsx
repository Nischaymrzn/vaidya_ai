import { useState } from "react"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { Button } from "@/components/ui/button"
import type { TRiskAssessment, THealthInsight } from "@/lib/definition"

type RiskAnalysisReportButtonProps = {
  assessment?: TRiskAssessment
  insights?: THealthInsight[]
  disabled?: boolean
  className?: string
}

const buildPdf = async (
  assessment: TRiskAssessment,
  insights: THealthInsight[] = [],
) => {
  const pdfDoc = await PDFDocument.create()
  let currentPage = pdfDoc.addPage([612, 792])
  const { width, height } = currentPage.getSize()

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const headerHeight = 64
  const drawHeader = () => {
    currentPage.drawRectangle({
      x: 0,
      y: height - headerHeight,
      width,
      height: headerHeight,
      color: rgb(0.16, 0.2, 0.26),
    })

    currentPage.drawText("VAIDYA REPORT", {
      x: 32,
      y: height - 40,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    })

    const subtitle = "Clinical Handoff Report"
    currentPage.drawText(subtitle, {
      x: 32,
      y: height - 58,
      size: 10,
      font,
      color: rgb(0.85, 0.9, 0.96),
    })
  }

  drawHeader()

  let cursorY = height - headerHeight - 24
  const marginX = 32
  const cardGap = 14
  const cardWidth = width - marginX * 2

  const ensureSpace = (neededHeight: number) => {
    if (cursorY - neededHeight > 40) return
    currentPage = pdfDoc.addPage([612, 792])
    drawHeader()
    cursorY = height - headerHeight - 24
  }

  const wrapText = (
    text: string,
    font: any,
    fontSize: number,
    maxWidth: number,
  ) => {
    const words = text.split(" ")
    const lines: string[] = []
    let current = ""

    words.forEach((word) => {
      const testLine = current ? `${current} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, fontSize)
      if (width > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = testLine
      }
    })

    if (current) lines.push(current)
    return lines
  }

  const drawSection = (title: string, body: string | string[]) => {
    const bodyLines = Array.isArray(body)
      ? body.flatMap((line) => wrapText(line, font, 10, cardWidth - 24))
      : wrapText(body, font, 10, cardWidth - 24)
    const titleHeight = 18
    const lineHeight = 14
    const bodyHeight = bodyLines.length * lineHeight
    const cardHeight = titleHeight + bodyHeight + 20

    ensureSpace(cardHeight)

    currentPage.drawRectangle({
      x: marginX,
      y: cursorY - cardHeight,
      width: cardWidth,
      height: cardHeight,
      color: rgb(0.96, 0.97, 0.99),
      borderColor: rgb(0.88, 0.9, 0.93),
      borderWidth: 1,
    })

    currentPage.drawText(title, {
      x: marginX + 12,
      y: cursorY - 16,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.24, 0.3),
    })

    let textY = cursorY - 32
    bodyLines.forEach((line) => {
      currentPage.drawText(line, {
        x: marginX + 12,
        y: textY,
        size: 10,
        font,
        color: rgb(0.3, 0.35, 0.42),
      })
      textY -= lineHeight
    })

    cursorY -= cardHeight + cardGap
  }


  const riskLevel = assessment.riskLevel ?? "--"
  const riskScore = assessment.riskScore ?? 0
  const confidence = assessment.confidenceScore
    ? Math.round(assessment.confidenceScore * 100)
    : null
  const summary = assessment.analysis?.summary ?? "No summary available."

  const demographics = assessment.analysis?.demographics
  const vitals = assessment.analysis?.vitalsSnapshot
  const formatValue = (value?: string | number | null) =>
    value === undefined || value === null || value === "" ? "N/A" : String(value)
  const formatDate = (value?: string | Date) => {
    if (!value) return "N/A"
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US")
  }

  drawSection(
    "I. Patient Information",
    [
      `Patient Name: ${formatValue(demographics?.name ?? "Member")}`,
      `Age: ${formatValue(demographics?.age)}`,
      `Gender: ${formatValue(demographics?.gender)}`,
      `Blood Group: ${formatValue(demographics?.bloodGroup)}`,
      `Height: ${formatValue(demographics?.heightCm)} cm`,
      `Weight: ${formatValue(demographics?.weightKg)} kg`,
    ],
  )

  drawSection(
    "II. Current Status - Vital Signs",
    [
      `Recorded At: ${formatDate(vitals?.recordedAt)}`,
      `Blood Pressure: ${formatValue(vitals?.systolicBp)}/${formatValue(vitals?.diastolicBp)} mmHg`,
      `Heart Rate: ${formatValue(vitals?.heartRate)} bpm`,
      `Glucose: ${formatValue(vitals?.glucoseLevel)} mg/dL`,
      `BMI: ${formatValue(vitals?.bmi)}`,
    ],
  )

  drawSection(
    "Overall summary",
    `${summary} Risk score ${riskScore}% (${riskLevel}). Confidence ${
      confidence !== null ? `${confidence}%` : "N/A"
    }.`,
  )

  const keyFindings =
    assessment.analysis?.keyFindings?.map(
      (finding) => `${finding.title}: ${finding.detail}`,
    ) ??
    insights.slice(0, 5).map(
      (insight) => `${insight.insightTitle}: ${insight.description}`,
    )
  drawSection(
    "Key findings",
    keyFindings.length ? keyFindings : ["No key findings available."],
  )

  const sections = assessment.analysis?.sections
  drawSection(
    "Vitals analysis",
    sections?.vitals ?? "No vitals analysis available.",
  )
  drawSection(
    "Symptoms analysis",
    sections?.symptoms ?? "No symptoms analysis available.",
  )
  drawSection(
    "Records analysis",
    sections?.records ?? "No records analysis available.",
  )
  drawSection(
    "Medications analysis",
    sections?.medications ?? "No medications analysis available.",
  )
  drawSection(
    "Allergies analysis",
    sections?.allergies ?? "No allergies analysis available.",
  )
  drawSection(
    "Immunizations analysis",
    sections?.immunizations ?? "No immunizations analysis available.",
  )

  const recommendations = assessment.analysis?.recommendations ?? []
  drawSection(
    "Recommendations",
    recommendations.length
      ? recommendations
      : ["No recommendations available."],
  )

  const nextSteps = assessment.analysis?.nextSteps ?? []
  if (nextSteps.length) {
    drawSection("Next steps", nextSteps)
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

export function RiskAnalysisReportButton({
  assessment,
  insights,
  disabled,
  className,
}: RiskAnalysisReportButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!assessment || downloading) return
    setDownloading(true)
    try {
      const pdfBytes = await buildPdf(assessment, insights)
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "risk-analysis-report.pdf"
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleDownload}
      disabled={disabled || downloading || !assessment}
    >
      {downloading ? "Generating report..." : "Generate report"}
    </Button>
  )
}
