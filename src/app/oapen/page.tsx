"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, ExternalHyperlink } from "docx"
import { saveAs } from "file-saver"
import toast, { Toaster } from "react-hot-toast"

// ✅ Match OAPEN API response
interface BookResult {
  Title: string
  Authors: string
  Year: string
  URL: string
}

export default function OapenScraperUI() {
  const [searchParams, setSearchParams] = useState({
    query: "",
    startYear: "2021",
    endYear: "2025",
    maxBooks: "50",
  })
  const [results, setResults] = useState<BookResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // 🔍 Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value })
  }

  // 🚀 Handle search submit
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchParams.query.trim()) return

    setIsLoading(true)
    setHasSearched(true)
    const toastId = toast.loading("Fetching books...")

    try {
      const response = await fetch(
        `https://oapen-scrapper-api.onrender.com/search?query=${encodeURIComponent(
          searchParams.query
        )}&start_year=${searchParams.startYear}&end_year=${searchParams.endYear}&max_books=${searchParams.maxBooks}`
      )

      if (!response.ok) throw new Error("Failed to fetch data")

      const data: BookResult[] = await response.json()
      setResults(data || [])

      if (data.length === 0) {
        toast("No results found.", { id: toastId })
      } else {
        toast.success(`Found ${data.length} book${data.length !== 1 ? "s" : ""}.`, { id: toastId })
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setResults([])
      toast.error(
        <div>
          <p>{error.message || "Something went wrong"}</p>
          <Button className="mt-2 text-sm" onClick={() => handleSubmit()}>
            Retry
          </Button>
        </div>,
        { id: toastId }
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 📥 CSV download
  const downloadCSV = () => {
    if (!results.length) return

    const headers = ["Year", "Authors", "Title", "URL"]
    const csvRows = [headers, ...results.map(b => [b.Year, b.Authors, b.Title, b.URL])]
    const csvContent = csvRows.map(row => row.map(val => `"${val}"`).join(",")).join("\n")
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" })
    const fileName = `${searchParams.query.replace(/\s+/g, "_")}_${searchParams.startYear}-${searchParams.endYear}.csv`
    saveAs(blob, fileName)
    toast.success("CSV download started.")
  }
// 📥 Word (DOCX) download
const downloadWord = async () => {
  if (!results.length) return

  const headers = ["Year", "Authors", "Title", "URL"]
  const tableWidth = 10000
  const colPercents = [10, 30, 40, 20]
  const colWidths = colPercents.map(p => Math.floor((p / 100) * tableWidth))

  // Header row
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

  // Data rows (no shading)
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
                        text: book.Title || "View Book",
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
            text: `OAPEN Book Results for "${searchParams.query}" (${searchParams.startYear}-${searchParams.endYear})`,
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
  const fileName = `${searchParams.query.replace(/\s+/g, "_")}_${searchParams.startYear}-${searchParams.endYear}.docx`
  saveAs(blob, fileName)
  toast.success("Word download started.")
}



  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />

      {/* Search Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">OAPEN Book Scraper</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input
                name="query"
                placeholder="Enter keyword(s)"
                value={searchParams.query}
                onChange={handleInputChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  name="startYear"
                  placeholder="Start Year"
                  value={searchParams.startYear}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="number"
                  name="endYear"
                  placeholder="End Year"
                  value={searchParams.endYear}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Input
                type="number"
                name="maxBooks"
                placeholder="Max Results"
                value={searchParams.maxBooks}
                onChange={handleInputChange}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2" /> Fetching...
                  </span>
                ) : (
                  "Fetch Books"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Table */}
      {hasSearched && (
        <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {results.length > 0 ? (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <div className="p-4 text-sm text-gray-600 mb-2">
                Showing {results.length} result{results.length !== 1 && "s"}
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Authors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      URL
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((book, idx) => (
                    <motion.tr
                      key={book.URL || idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.Year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.Authors}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.Title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                        <a href={book.URL} target="_blank" rel="noopener noreferrer">
                          View Book
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 flex gap-2">
                <Button onClick={downloadCSV} className="w-1/2" disabled={!results.length}>
                  Download CSV
                </Button>
                <Button onClick={downloadWord} className="w-1/2" disabled={!results.length}>
                  Download Word
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No results found for your search.</p>
          )}
        </motion.div>
      )}
    </div>
  )
}
