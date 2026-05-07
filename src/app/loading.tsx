"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4">
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-16 w-16 rounded-xl bg-indigo-600/20"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-8 w-8 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/50" />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading Hub</h3>
        <p className="text-sm text-slate-500">Preparing your academic tools...</p>
      </motion.div>
    </div>
  );
}
