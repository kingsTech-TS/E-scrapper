"use client"

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, ExternalHyperlink
} from "docx"
import { saveAs } from "file-saver"
import toast from "react-hot-toast"
import ScraperTemplate, { SearchParams } from "@/components/ScraperTemplate"
import { ExternalLink } from "lucide-react"

interface BookResult {
  Title: string
  Authors: string
  Year: number
  URL: string
  Subject: string
}

export default function OpenAlexScraper() {
  const onSearch = async (params: SearchParams) => {
    const response = await fetch(
      `https://openalex-scrapper-api.onrender.com/books?subjects=${encodeURIComponent(
        params.subject
      )}&start_year=${params.startYear}&end_year=${params.endYear}&max_results=${params.limit}&format=json`
    )

    if (!response.ok) throw new Error("Failed to fetch data")

    const data = await response.json()

    // Normalize field names
    return (data || []).map((b: any) => ({
      Title: b.Title || b.title || "",
      Authors: b.Authors || b.authors || "",
      Year: Number(b.Year || b.year || 0),
      URL: b.URL || b.url || "",
      Subject: b.Subject || b.subject || "",
    }))
  }

  const downloadCSV = (results: BookResult[], params: SearchParams) => {
    if (results.length === 0) return

    try {
      const headers = ["Year", "Authors", "Title", "URL", "Subject"]
      const csvRows = [
        headers,
        ...results.map((book) => [
          book.Year || "",
          book.Authors,
          book.Title,
          book.URL,
          book.Subject,
        ]),
      ]

      const csvContent = csvRows
        .map((row) => row.map((val) => `"${val}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const subjectSafe = params.subject.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")
      const fileName = `${subjectSafe || "openalex_books"}_${params.startYear}-${params.endYear}.csv`

      saveAs(blob, fileName)
      toast.success("CSV download started.")
    } catch (err: any) {
      toast.error(`Error downloading CSV: ${err.message || "Something went wrong"}`)
    }
  }

  const downloadWord = async (results: BookResult[], params: SearchParams) => {
    if (results.length === 0) return

    try {
      const subjectSafe = params.subject.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")
      const fileName = `${subjectSafe || "openalex_books"}_${params.startYear}-${params.endYear}.docx`

      const tableWidth = 10000
      const colPercents = [10, 20, 40, 20, 10]
      const colWidths = colPercents.map(p => Math.floor((p / 100) * tableWidth))
      const headers = ["Year", "Authors", "Title", "URL", "Subject"]

      const headerRow = new TableRow({
        children: headers.map((header, i) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: header, bold: true })],
              }),
            ],
            width: { size: colWidths[i], type: WidthType.DXA },
          })
        ),
      })

      const dataRows = results.map(
        (book) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: String(book.Year || "") })],
                width: { size: colWidths[0], type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph({ text: book.Authors || "" })],
                width: { size: colWidths[1], type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph({ text: book.Title || "" })],
                width: { size: colWidths[2], type: WidthType.DXA },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: book.URL
                      ? [
                          new ExternalHyperlink({
                            link: book.URL,
                            children: [
                              new TextRun({
                                text: "View",
                                style: "Hyperlink",
                              }),
                            ],
                          }),
                        ]
                      : [new TextRun({ text: "" })],
                  }),
                ],
                width: { size: colWidths[3], type: WidthType.DXA },
              }),
              new TableCell({
                children: [new Paragraph({ text: book.Subject || "" })],
                width: { size: colWidths[4], type: WidthType.DXA },
              }),
            ],
          })
      )

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: `OpenAlex Book Results for "${params.subject}" (${params.startYear}-${params.endYear})`,
                heading: "Heading1",
              }),
              new Paragraph({ text: " " }),
              new Table({
                width: { size: tableWidth, type: WidthType.DXA },
                rows: [headerRow, ...dataRows],
              }),
            ],
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, fileName)
      toast.success("Word document download started.")
    } catch (err: any) {
      toast.error(`Error downloading Word document: ${err.message || "Something went wrong"}`)
    }
  }

  const columns = [
    { key: "Year", label: "Year" },
    { key: "Authors", label: "Authors" },
    { key: "Title", label: "Title" },
    { key: "Subject", label: "Subject" },
    { 
      key: "URL", 
      label: "Link",
      render: (val: string) => (
        <a href={val} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
          View <ExternalLink className="h-3 w-3" />
        </a>
      )
    },
  ]

  return (
    <ScraperTemplate
      title="OpenAlex Scraper"
      description="Access a massive index of scholarly entities from OpenAlex."
      onSearch={onSearch}
      onDownloadCSV={downloadCSV}
      onDownloadWord={downloadWord}
      columns={columns}
    />
  )
}
