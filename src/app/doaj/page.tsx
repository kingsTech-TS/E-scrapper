"use client";

import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, ExternalHyperlink 
} from "docx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import ScraperTemplate, { SearchParams } from "@/components/ScraperTemplate";
import { ExternalLink } from "lucide-react";

interface ArticleResult {
  Journal: string;
  Title: string;
  Authors: string | string[];
  Year: string | number;
  URL: string;
}

export default function DoajScraper() {
  const onSearch = async (params: SearchParams) => {
    const res = await fetch(
      `/api/search?query=${params.subject}&year_from=${params.startYear}&year_to=${params.endYear}&size=${params.limit}`
    );

    if (!res.ok) throw new Error("Failed to fetch");

    return await res.json();
  };

  const downloadCSV = async (results: ArticleResult[], params: SearchParams) => {
    if (results.length === 0) return

    try {
      const headers = ["Journal", "Title", "Authors", "Year", "URL"];
      const csvRows = [
        headers,
        ...results.map((a) => [
          a.Journal || "—",
          a.Title || "—",
          Array.isArray(a.Authors) ? a.Authors.join(", ") : a.Authors || "—",
          a.Year?.toString() || "—",
          a.URL || "—",
        ]),
      ];

      const csvContent = csvRows
        .map((row) => row.map((val) => `"${val}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const safeQuery = params.subject.trim().replace(/[^a-z0-9]/gi, "_");
      const fileName = `${safeQuery || "doaj_articles"}_${params.startYear}-${params.endYear}.csv`;

      saveAs(blob, fileName);
      toast.success("CSV download started.");
    } catch (err: any) {
      toast.error(`Error downloading CSV: ${err.message || "Something went wrong"}`);
    }
  };

  const downloadWord = async (results: ArticleResult[], params: SearchParams) => {
    if (results.length === 0) return;

    try {
      const headerRow = new TableRow({
        children: ["Journal", "Title", "Authors", "Year", "URL"].map(
          (text) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text, bold: true })],
                }),
              ],
              shading: { fill: "E5E7EB" },
            })
        ),
      });

      const tableRows = [
        headerRow,
        ...results.map(
          (a) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(a.Journal || "—")] }),
                new TableCell({ children: [new Paragraph(a.Title || "—")] }),
                new TableCell({
                  children: [
                    new Paragraph(
                      Array.isArray(a.Authors) ? a.Authors.join(", ") : a.Authors || "—"
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
            children: [
              new Paragraph({
                text: `DOAJ Articles Results for "${params.subject}" (${params.startYear}-${params.endYear})`,
                heading: "Heading1",
              }),
              new Paragraph(""),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              }),
            ],
          },
        ],
      });

      const safeQuery = params.subject.trim().replace(/[^a-z0-9]/gi, "_");
      const fileName = `${safeQuery || "doaj_articles"}_${params.startYear}-${params.endYear}.docx`;

      const blob = await Packer.toBlob(doc);
      saveAs(blob, fileName);
      toast.success("Word document download started.");
    } catch (err: any) {
      toast.error(`Error downloading Word document: ${err.message || "Something went wrong"}`);
    }
  };

  const columns = [
    { key: "Journal", label: "Journal" },
    { key: "Title", label: "Title" },
    { 
      key: "Authors", 
      label: "Authors",
      render: (val: any) => (Array.isArray(val) ? val.join(", ") : val || "—")
    },
    { key: "Year", label: "Year" },
    { 
      key: "URL", 
      label: "Link",
      render: (val: string) => (
        <a href={val} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
          View <ExternalLink className="h-3 w-3" />
        </a>
      )
    },
  ];

  return (
    <ScraperTemplate
      title="DOAJ Scraper"
      description="Fetch open access journal articles from the Directory of Open Access Journals."
      onSearch={onSearch}
      onDownloadCSV={downloadCSV}
      onDownloadWord={downloadWord}
      columns={columns}
      defaultParams={{ limit: "10" }}
    />
  );
}
