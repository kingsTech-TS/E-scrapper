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
  Year: string
  "Author(s)/Contributors": string
  Title: string
  URL: string
}

export default function DoabScraper() {
  const onSearch = async (params: SearchParams) => {
    const response = await fetch(
      `https://doab-scrapper-api.onrender.com/scrape?query=${encodeURIComponent(
        params.subject
      )}&start_year=${params.startYear}&end_year=${params.endYear}&limit=${params.limit}`
    )

    if (!response.ok) throw new Error("Failed to fetch data")

    const data = await response.json()
    return data.books || []
  }

  const downloadCSV = async (results: BookResult[], params: SearchParams) => {
    if (results.length === 0) return

    try {
      const headers = ["Year", "Author(s)/Contributors", "Title", "URL"]
      const csvRows = [
        headers,
        ...results.map((book) => [
          book.Year,
          book["Author(s)/Contributors"],
          book.Title,
          book.URL,
        ]),
      ]

      const csvContent = csvRows
        .map((row) => row.map((val) => `"${val}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const subjectSafe = params.subject.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")
      const fileName = `${subjectSafe || "doab_books"}_${params.startYear}-${params.endYear}.csv`

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
      const fileName = `${subjectSafe || "doab_books"}_${params.startYear}-${params.endYear}.docx`

      const tableWidth = 10000
      const colPercents = [10, 25, 45, 20]
      const colWidths = colPercents.map(p => Math.floor((p / 100) * tableWidth))
      const headers = ["Year", "Author(s)/Contributors", "Title", "URL"]

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
              { val: book.Year, width: colWidths[0] },
              { val: book["Author(s)/Contributors"], width: colWidths[1] },
              { val: book.Title, width: colWidths[2] },
              { val: book.URL, width: colWidths[3], isLink: true },
            ].map((col) => {
              if (col.isLink && col.val) {
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
                text: `DOAB Book Results for "${params.subject}" (${params.startYear}-${params.endYear})`,
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
    { key: "Author(s)/Contributors", label: "Authors" },
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
      title="DOAB Scraper"
      description="Browse and fetch open access books from the Directory of Open Access Books."
      onSearch={onSearch}
      onDownloadCSV={downloadCSV}
      onDownloadWord={downloadWord}
      columns={columns}
    />
  )
}
