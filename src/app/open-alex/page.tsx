"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, ExternalHyperlink
} from "docx"
import { saveAs } from "file-saver"
import toast, { Toaster } from "react-hot-toast"

// ✅ Match normalized data shape
interface BookResult {
  Title: string
  Authors: string
  Year: number
  URL: string
  Subject: string
}

export default function ScraperUI() {
  const [searchParams, setSearchParams] = useState({
    subject: "",
    startYear: "2021",
    endYear: "2025",
    globalLimit: "50",
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
    setIsLoading(true)
    setHasSearched(true)

    const toastId = toast.loading("Fetching books...")

    try {
      const response = await fetch(
        `https://openalex-scrapper-api.onrender.com/books?subjects=${encodeURIComponent(
          searchParams.subject
        )}&start_year=${searchParams.startYear}&end_year=${searchParams.endYear}&max_results=${searchParams.globalLimit}&format=json`
      )

      if (!response.ok) throw new Error("Failed to fetch data")

      const data = await response.json()

      // 🔑 Normalize field names
      const normalized: BookResult[] = (data || []).map((b: any) => ({
        Title: b.Title || b.title || "",
        Authors: b.Authors || b.authors || "",
        Year: Number(b.Year || b.year || 0), // ✅ Always number
        URL: b.URL || b.url || "",
        Subject: b.Subject || b.subject || "",
      }))

      setResults(normalized)

      toast.success(`Found ${normalized.length || 0} books.`, { id: toastId })
      if (normalized.length === 0) toast("No results found for your search.", { id: toastId })
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setResults([])
      toast.error(
        <div>
          <p>{error.message || "Something went wrong"}</p>
          <Button
            className="mt-2 text-sm"
            onClick={() => handleSubmit()}
          >
            Retry
          </Button>
        </div>,
        { id: toastId }
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 📥 Download CSV
  const downloadCSV = () => {
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
      const subjectSafe = searchParams.subject
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")
      const fileName = `${subjectSafe || "books"}_${searchParams.startYear}-${searchParams.endYear}.csv`

      saveAs(blob, fileName)
      toast.success("CSV download started.")
    } catch (err: any) {
      toast.error(`Error downloading CSV: ${err.message || "Something went wrong"}`)
    }
  }

  // 📥 Download Word (DOCX)
  const downloadWord = async () => {
    if (results.length === 0) return

    try {
      const subjectSafe = searchParams.subject
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")
      const fileName = `${subjectSafe || "books"}_${searchParams.startYear}-${searchParams.endYear}.docx`

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
                children: [new Paragraph({ text: String(book.Year || "") })], // ✅ force string
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
                                text: "View Book",
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
                text: `Book Results for "${searchParams.subject}" (${searchParams.startYear}-${searchParams.endYear})`,
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
      toast.success("Word download started.")
    } catch (err: any) {
      toast.error(`Error downloading Word: ${err.message || "Something went wrong"}`)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              OpenAlex Book Scraper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input
                name="subject"
                placeholder="Enter subject(s), e.g. Marketing, Chemistry"
                value={searchParams.subject}
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
                name="globalLimit"
                placeholder="Max Results (e.g. 50)"
                value={searchParams.globalLimit}
                onChange={handleInputChange}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2" />
                    Fetching...
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
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {results.length > 0 ? (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Showing {results.length} result{results.length !== 1 && "s"}
                </p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((book, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.Year || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.Authors}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.Title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                        <a
                          href={book.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Book
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.Subject}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 flex gap-2">
                <Button onClick={downloadCSV} className="w-1/2" disabled={results.length === 0}>
                  Download CSV
                </Button>
                <Button onClick={downloadWord} className="w-1/2" disabled={results.length === 0}>
                  Download Word
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No results found for your search.
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
