"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold text-blue-900 mb-4">
          📚 Welcome to the Library Scraper Hub
        </h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          Choose which scraper you want to use to fetch academic articles or books.
          Both scrapers are fast, reliable, and export results to Word format.
        </p>
      </motion.div>

      {/* Scraper Options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* DOAJ */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white shadow-xl rounded-3xl p-10 cursor-pointer hover:shadow-2xl transition"
          onClick={() => navigateTo("/doaj")}
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-4">DOAJ Scraper</h2>
          <p className="text-gray-600">
            Fetch open access journal articles by topic, filter by year, and export
            results to a Word document.
          </p>
        </motion.div>

        {/* DOAB */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white shadow-xl rounded-3xl p-10 cursor-pointer hover:shadow-2xl transition"
          onClick={() => navigateTo("/doab")}
        >
          <h2 className="text-2xl font-bold text-green-700 mb-4">DOAB Scraper</h2>
          <p className="text-gray-600">
            Browse and fetch open access books, filter by year or subject, and
            export your selections to Word format.
          </p>
        </motion.div>

          {/* Open-alex */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white shadow-xl rounded-3xl p-10 cursor-pointer hover:shadow-2xl transition"
          onClick={() => navigateTo("/open-alex")}
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-4">OPEN-ALEX Scraper</h2>
          <p className="text-gray-600">
            Browse and fetch open access books, filter by year or subject, and
            export your selections to Word format.
          </p>
        </motion.div>

         {/* OAPEN */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white shadow-xl rounded-3xl p-10 cursor-pointer hover:shadow-2xl transition"
          onClick={() => navigateTo("/doab")}
        >
          <h2 className="text-2xl font-bold text-green-700 mb-4">OAPEN Scraper</h2>
          <p className="text-gray-600">
            Browse and fetch open access books, filter by year or subject, and
            export your selections to Word format.
          </p>
        </motion.div>
      </motion.div>

      

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-16 text-gray-500 italic"
      >
        Made with ❤️ for academic exploration
      </motion.p>
    </div>
  );
}
