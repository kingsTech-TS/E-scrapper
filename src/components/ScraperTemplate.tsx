"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Download, FileText, Table as TableIcon, RefreshCw, ExternalLink, Filter } from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import toast from "react-hot-toast";

interface ScraperTemplateProps {
  title: string;
  description: string;
  onSearch: (params: SearchParams) => Promise<any[]>;
  onDownloadCSV: (results: any[], params: SearchParams) => void;
  onDownloadWord: (results: any[], params: SearchParams) => void;
  defaultParams?: Partial<SearchParams>;
  columns: { key: string; label: string; render?: (val: any) => React.ReactNode }[];
}

export interface SearchParams {
  subject: string;
  startYear: string;
  endYear: string;
  limit: string;
}

export default function ScraperTemplate({
  title,
  description,
  onSearch,
  onDownloadCSV,
  onDownloadWord,
  defaultParams,
  columns,
}: ScraperTemplateProps) {
  const [params, setParams] = useState<SearchParams>({
    subject: "",
    startYear: "2021",
    endYear: "2025",
    limit: "50",
    ...defaultParams,
  });
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!params.subject.trim()) {
      toast.error("Please enter a search topic");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    const toastId = toast.loading("Searching database...");

    try {
      const data = await onSearch(params);
      setResults(data || []);
      toast.success(`Found ${data?.length || 0} results`, { id: toastId });
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "Failed to fetch results", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">{description}</p>
        </div>
        {hasSearched && results.length > 0 && (
          <div className="flex items-center gap-3 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <Button
              variant="ghost"
              onClick={() => onDownloadCSV(results, params)}
              className="gap-2 text-xs font-bold uppercase tracking-wider h-10 px-4 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <TableIcon className="h-4 w-4 text-emerald-500" /> CSV
            </Button>
            <Button
              onClick={() => onDownloadWord(results, params)}
              className="gap-2 text-xs font-bold uppercase tracking-wider h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-lg transition-all"
            >
              <FileText className="h-4 w-4" /> Word
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
                <Filter className="h-4 w-4 text-indigo-500" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Topic / Subject</label>
                  <Input
                    name="subject"
                    placeholder="e.g. Quantum Physics"
                    value={params.subject}
                    onChange={handleInputChange}
                    className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Year</label>
                    <Input
                      name="startYear"
                      type="number"
                      value={params.startYear}
                      onChange={handleInputChange}
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Year</label>
                    <Input
                      name="endYear"
                      type="number"
                      value={params.endYear}
                      onChange={handleInputChange}
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Results</label>
                  <Input
                    name="limit"
                    type="number"
                    value={params.limit}
                    onChange={handleInputChange}
                    className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Working...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" /> Start Scraper
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Main Content / Results */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!hasSearched ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/30 dark:bg-transparent"
              >
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-indigo-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to Explore?</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Configure your parameters and hit "Start Scraper" to begin fetching data.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    Search Results
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                      {results.length} items
                    </span>
                  </h2>
                  {results.length > 0 && (
                    <button 
                      onClick={() => handleSubmit()} 
                      disabled={isLoading}
                      className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Update
                    </button>
                  )}
                </div>

                {results.length > 0 ? (
                  <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800 border-none">
                          <TableRow className="hover:bg-transparent border-none">
                            {columns.map((col) => (
                              <TableHead key={col.key} className="h-14 text-[10px] font-black uppercase tracking-widest text-slate-400 border-none">
                                {col.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((result, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-slate-50 dark:border-slate-800">
                              {columns.map((col) => (
                                <TableCell key={col.key} className="py-5 text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {col.render ? col.render(result[col.key]) : result[col.key]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                ) : !isLoading && (
                  <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-6">
                      <Search className="h-8 w-8 text-rose-500 opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No items found</h3>
                    <p className="text-slate-500">We couldn't find any results matching your search criteria.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
