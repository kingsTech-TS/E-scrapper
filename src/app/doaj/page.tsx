"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ExternalHyperlink,
} from "docx";
import { saveAs } from "file-saver";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion"

export default function Home() {
  const [query, setQuery] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [size, setSize] = useState(10);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async () => {
    if (!query) {
      toast.error("⚠️ Please enter a topic before searching.");
      return;
    }

    setLoading(true);
    setArticles([]);

    const loadingToast = toast.loading("Fetching articles...");

    try {
      const res = await fetch(
        `/api/search?query=${query}&year_from=${yearFrom}&year_to=${yearTo}&size=${size}`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (data.length === 0) {
        toast("No results found 🚫", { icon: "🔍" });
      } else {
        setArticles(data);
        toast.success(`✅ Found ${data.length} articles`);
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("❌ Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // 📄 Generate Word Doc
  const downloadWord = async () => {
    if (articles.length === 0) {
      toast.error("⚠️ No articles to export.");
      return;
    }

    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Journal", bold: true })],
            }),
          ],
          shading: { fill: "E5E7EB" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Title", bold: true })],
            }),
          ],
          shading: { fill: "E5E7EB" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Authors", bold: true })],
            }),
          ],
          shading: { fill: "E5E7EB" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Year", bold: true })],
            }),
          ],
          shading: { fill: "E5E7EB" },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "URL", bold: true })],
            }),
          ],
          shading: { fill: "E5E7EB" },
        }),
      ],
    });

    const tableRows = [
      headerRow,
      ...articles.map(
        (a) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(a.Journal || "—")] }),
              new TableCell({ children: [new Paragraph(a.Title || "—")] }),
              new TableCell({
                children: [
                  new Paragraph(
                    Array.isArray(a.Authors)
                      ? a.Authors.join(", ")
                      : a.Authors || "—"
                  ),
                ],
              }),
              new TableCell({
                children: [new Paragraph(a.Year?.toString() || "—")],
              }),
              new TableCell({
                children: [
                  a.URL
                    ? new Paragraph({
                      children: [
                        new ExternalHyperlink({
                          children: [
                            new TextRun({
                              text: "View",
                              style: "Hyperlink",
                            }),
                          ],
                          link: a.URL,
                        }),
                      ],
                    })
                    : new Paragraph("—"),
                ],
              }),
            ],
          })
      ),
    ];

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "DOAJ Articles Export",
              heading: "Heading1",
            }),
            new Paragraph(""),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
              borders: {
                top: { style: "single", size: 1, color: "000000" },
                bottom: { style: "single", size: 1, color: "000000" },
                left: { style: "single", size: 1, color: "000000" },
                right: { style: "single", size: 1, color: "000000" },
                insideHorizontal: { style: "single", size: 1, color: "000000" },
                insideVertical: { style: "single", size: 1, color: "000000" },
              },
            }),
          ],
        },
      ],
    });

    // 📂 Dynamic file name based on topic + years
    const safeQuery = query.trim().replace(/[^a-z0-9]/gi, "_");
    let fileName = safeQuery;

    if (yearFrom && yearTo) {
      fileName += `_${yearFrom}-${yearTo}`;
    } else if (yearFrom) {
      fileName += `_from_${yearFrom}`;
    } else if (yearTo) {
      fileName += `_up_to_${yearTo}`;
    } else {
      fileName += `_all_years`;
    }

    fileName += ".docx";

    // ✅ FIX: Actually generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  };

  return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />


      {/* Search Form */}
      <Card className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6 mb-10">

        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            DOAJ Book Scraper
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Enter topic (e.g. African Studies)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="number"
            placeholder="Start Year (e.g. 2021)"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="number"
            placeholder="End Year (e.g. 2025)"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="number"
            placeholder="No. of results (e.g. 20)"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full"
          />
        </div>

        <button
          onClick={fetchArticles}
          disabled={loading}
          className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition cursor-pointer"
        >
          {loading ? "Loading..." : "Search Articles"}
        </button>
      </Card>
      

      {/* Results */}
      <div className="max-w-6xl mx-auto">
        {articles.length > 0 ? (
          <div className="overflow-x-auto shadow-lg rounded-2xl">
            <table className="w-full border-collapse bg-white rounded-2xl">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-3 text-left border">Journal</th>
                  <th className="p-3 text-left border">Title</th>
                  <th className="p-3 text-left border">Authors</th>
                  <th className="p-3 text-left border">Year</th>
                  <th className="p-3 text-left border">URL</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50 transition text-sm"
                  >
                    <td className="p-3 border">{a.Journal || "—"}</td>
                    <td className="p-3 border">{a.Title}</td>
                    <td className="p-3 border">
                      {Array.isArray(a.Authors)
                        ? a.Authors.join(", ")
                        : a.Authors || "—"}
                    </td>
                    <td className="p-3 border">{a.Year || "—"}</td>
                    <td className="p-3 border">
                      {a.URL ? (
                        <a
                          href={a.URL}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* 📄 Download button */}
            <button
              onClick={downloadWord}
              disabled={articles.length === 0}
              className={`mt-4 w-full py-2 rounded-lg cursor-pointer transition ${articles.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
                }`}
            >
              ⬇Download as Word
            </button>
          </div>
        ) : (
          !loading && (
            <p className="text-center text-gray-400 italic mt-6">
              🔍 Start by searching for a topic above...
            </p>
          )
        )}
      </div>
    </div>
    </motion.div>
  );
}//make this look like the picture