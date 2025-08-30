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

// ✅ Match API response keys
interface BookResult {
  Year: string
  "Author(s)/Contributors": string
  Title: string
  URL: string
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
        `https://doab-scrapper-api.onrender.com/scrape?query=${encodeURIComponent(
          searchParams.subject
        )}&start_year=${searchParams.startYear}&end_year=${searchParams.endYear}&limit=${searchParams.globalLimit}`
      )

      if (!response.ok) throw new Error("Failed to fetch data")

      const data = await response.json()
      setResults(data.books || [])

      toast.success(`Found ${data.books?.length || 0} books.`, { id: toastId })
      if (data.books.length === 0) toast("No results found for your search.", { id: toastId })
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
      {/* React Hot Toast container */}
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
              DOAB Book Scraper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input
                name="subject"
                placeholder="Enter subject/course (e.g. Computer Science)"
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
                placeholder="Global Limit (e.g. 50)"
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
                  "Scrape Books"
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
                      Author(s)/Contributors
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
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.Year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book["Author(s)/Contributors"]}
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 flex gap-2">
                <Button onClick={downloadCSV} className="w-1/2">
                  Download CSV
                </Button>
                <Button onClick={downloadWord} className="w-1/2">
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
