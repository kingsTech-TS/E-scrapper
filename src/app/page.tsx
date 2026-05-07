"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaBook, FaSearch, FaGlobe, FaArchive, FaArrowRight, FaFilter, FaTimes } from "react-icons/fa";
import { Input } from "@/components/ui/input";

const scrapers = [
  {
    id: "doaj",
    title: "DOAJ Scraper",
    description: "Fetch open access journal articles by topic, filter by year, and export results to a Word document.",
    icon: <FaSearch />,
    color: "bg-blue-500",
    path: "/doaj",
    stats: "80M+ Articles",
    tags: ["journals", "articles", "open access"]
  },
  {
    id: "doab",
    title: "DOAB Scraper",
    description: "Browse and fetch open access books, filter by year or subject, and export your selections to Word format.",
    icon: <FaBook />,
    color: "bg-indigo-500",
    path: "/doab",
    stats: "70k+ Books",
    tags: ["books", "monographs", "academic"]
  },
  {
    id: "open-alex",
    title: "OPEN-ALEX Scraper",
    description: "Access a massive index of scholarly entities. Filter by year or subject with deep metadata coverage.",
    icon: <FaGlobe />,
    color: "bg-emerald-500",
    path: "/open-alex",
    stats: "250M+ Works",
    tags: ["global", "entities", "metadata", "works"]
  },
  {
    id: "oapen",
    title: "OAPEN Scraper",
    description: "Search the Online Library and Publication platform for open access books and chapters.",
    icon: <FaArchive />,
    color: "bg-amber-500",
    path: "/oapen",
    stats: "30k+ Publications",
    tags: ["library", "chapters", "books"]
  }
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredScrapers = scrapers.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-12 pb-12">
      {/* Hero & Command Center */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-20 text-center text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.4),transparent)]" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-2xl"
        >
          <span className="mb-4 inline-block rounded-full bg-indigo-500/20 px-4 py-1.5 text-sm font-semibold text-indigo-300 backdrop-blur-md">
            The Ultimate Research Hub
          </span>
          <h1 className="mb-8 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Find. Scrape. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Export.</span>
          </h1>
          
          <div className="relative group max-w-lg mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl px-4 shadow-xl">
              <FaSearch className="text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Search tools (e.g. 'books', 'journals')..."
                className="w-full py-4 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Scraper Grid */}
      <section>
        <div className="mb-8 flex items-end justify-between px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaFilter className="text-sm text-indigo-500" /> 
              {searchQuery ? "Search Results" : "Available Tools"}
            </h2>
            <p className="text-slate-500 text-sm">
              {searchQuery 
                ? `Found ${filteredScrapers.length} tool${filteredScrapers.length === 1 ? "" : "s"} matching "${searchQuery}"`
                : "Select a specialized scraper to begin your research"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredScrapers.map((scraper, index) => (
              <motion.div
                key={scraper.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -8 }}
                onClick={() => router.push(scraper.path)}
                className="group cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm transition-all hover:shadow-2xl border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`rounded-2xl ${scraper.color} p-4 text-white shadow-lg shadow-indigo-500/10`}>
                    {scraper.icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                      Database Size
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {scraper.stats}
                    </span>
                  </div>
                </div>
                
                <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {scraper.title}
                </h3>
                <p className="mb-8 text-slate-500 dark:text-slate-400 leading-relaxed">
                  {scraper.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {scraper.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md font-bold uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                    Open Tool <FaArrowRight className="ml-2 h-3 w-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredScrapers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
              <FaSearch size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No tools found</h3>
            <p className="text-slate-500">Try searching for something else like "books" or "journals".</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-6 text-indigo-600 font-bold hover:underline"
            >
              Clear Search
            </button>
          </motion.div>
        )}
      </section>

      {/* Quick Tips */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Search Smarter", desc: "Use specific keywords for better scraping results." },
          { title: "Export Options", desc: "All scrapers support Word (.docx) and CSV exports." },
          { title: "Fast Processing", desc: "Our scrapers are optimized for high-speed data retrieval." }
        ].map((tip, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{tip.title}</h4>
            <p className="text-sm text-slate-500">{tip.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
