"use client"

import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, ExternalHyperlink } from "docx"
import { saveAs } from "file-saver"
import toast from "react-hot-toast"
import ScraperTemplate, { SearchParams } from "@/components/ScraperTemplate"
import { ExternalLink } from "lucide-react"

interface BookResult {
  Title: string
  Authors: string
  Year: string
  URL: string
}

export default function OapenScraper() {
  const onSearch = async (params: SearchParams) => {
    const response = await fetch(
      `https://oapen-scrapper-api.onrender.com/search?query=${encodeURIComponent(
        params.subject
      )}&start_year=${params.startYear}&end_year=${params.endYear}&max_books=${params.limit}`
    )

    if (!response.ok) throw new Error("Failed to fetch data")

    return await response.json()
  }

  const downloadCSV = (results: BookResult[], params: SearchParams) => {
    if (!results.length) return

    try {
      const headers = ["Year", "Authors", "Title", "URL"]
      const csvRows = [headers, ...results.map(b => [b.Year, b.Authors, b.Title, b.URL])]
      const csvContent = csvRows.map(row => row.map(val => `"${val}"`).join(",")).join("\n")
      const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" })
      const fileName = `${params.subject.replace(/\s+/g, "_")}_${params.startYear}-${params.endYear}.csv`
      saveAs(blob, fileName)
      toast.success("CSV download started.")
    } catch (err: any) {
      toast.error(`Error downloading CSV: ${err.message || "Something went wrong"}`)
    }
  }

  const downloadWord = async (results: BookResult[], params: SearchParams) => {
    if (!results.length) return

    try {
      const headers = ["Year", "Authors", "Title", "URL"]
      const tableWidth = 10000
      const colPercents = [10, 30, 40, 20]
      const colWidths = colPercents.map(p => Math.floor((p / 100) * tableWidth))

      const headerRow = new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: h, bold: true })],
              }),
            ],
            width: { size: colWidths[i], type: WidthType.DXA },
          })
        ),
      })

      const dataRows = results.map(book =>
        new TableRow({
          children: [
            { val: book.Year, width: colWidths[0] },
            { val: book.Authors, width: colWidths[1] },
            { val: book.Title, width: colWidths[2] },
            { val: book.URL, width: colWidths[3], isLink: true },
          ].map(col => {
            if ((col as any).isLink && col.val) {
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new ExternalHyperlink({
                        link: col.val,
                        children: [
                          new TextRun({
                            text: "View Book",
                            style: "Hyperlink",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                width: { size: col.width, type: WidthType.DXA },
              })
            }

            return new TableCell({
              children: [new Paragraph({ text: col.val || "" })],
              width: { size: col.width, type: WidthType.DXA },
            })
          }),
        })
      )

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: `OAPEN Book Results for "${params.subject}" (${params.startYear}-${params.endYear})`,
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
      const fileName = `${params.subject.replace(/\s+/g, "_")}_${params.startYear}-${params.endYear}.docx`
      saveAs(blob, fileName)
      toast.success("Word download started.")
    } catch (err: any) {
      toast.error(`Error downloading Word: ${err.message || "Something went wrong"}`)
    }
  }

  const columns = [
    { key: "Year", label: "Year" },
    { key: "Authors", label: "Authors" },
    { key: "Title", label: "Title" },
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
      title="OAPEN Scraper"
      description="Search the Online Library and Publication platform for open access books and chapters."
      onSearch={onSearch}
      onDownloadCSV={downloadCSV}
      onDownloadWord={downloadWord}
      columns={columns}
    />
  )
}
