"use client"

import { useCallback } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

type ReportDownloadButtonProps = {
  title: string
  filename: string
  lines: string[]
  disabled?: boolean
  className?: string
  label?: string
}

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

const byteLength = (value: string) => new TextEncoder().encode(value).length

const buildPdfBytes = (title: string, lines: string[]) => {
  const contentLines: string[] = [
    "BT",
    "/F1 18 Tf",
    "72 740 Td",
    `(${escapePdfText(title)}) Tj`,
    "/F1 12 Tf",
  ]

  lines.forEach((line, index) => {
    contentLines.push(index === 0 ? "0 -28 Td" : "0 -18 Td")
    contentLines.push(`(${escapePdfText(line)}) Tj`)
  })

  contentLines.push("ET")

  const contentStream = contentLines.join("\n")
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${byteLength(contentStream)} >>\nstream\n${contentStream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]

  let body = "%PDF-1.4\n"
  let position = byteLength(body)
  const offsets: number[] = [0]

  objects.forEach((object, index) => {
    offsets[index + 1] = position
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`
    body += chunk
    position += byteLength(chunk)
  })

  const xrefOffset = position
  let xref = `xref\n0 ${objects.length + 1}\n`
  xref += "0000000000 65535 f \n"
  for (let i = 1; i <= objects.length; i += 1) {
    xref += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  const pdf = body + xref + trailer

  return new TextEncoder().encode(pdf)
}

export function ReportDownloadButton({
  title,
  filename,
  lines,
  disabled,
  className,
  label,
}: ReportDownloadButtonProps) {
  const handleDownload = useCallback(() => {
    const pdfBytes = buildPdfBytes(title, lines)
    const blob = new Blob([pdfBytes], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filename, lines, title])

  return (
    <Button
      type="button"
      variant="outline"
      className={className ?? "rounded-full"}
      onClick={handleDownload}
      disabled={disabled}
    >
      <Download className="mr-2 h-4 w-4" />
      {label ?? "Download report PDF"}
    </Button>
  )
}
