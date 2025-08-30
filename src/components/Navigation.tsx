"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaBookOpen, FaBook } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";

const navItems = [
  { label: "DOAJ", path: "/doaj", icon: <FaBookOpen /> },
  { label: "DOAB", path: "/doab", icon: <FaBook /> },
];

export default function Navigation() {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = () => setExpanded(true);

  // Auto-collapse after 10 seconds
  useEffect(() => {
    if (expanded) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setExpanded(false), 10000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [expanded]);

  const isExpanded = expanded || hovered;

  return (
    <div
      className="fixed top-1/4 left-4 z-50 flex flex-col items-start"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="mb-6 p-3 rounded-full bg-primary hover:bg-primary/90 transition shadow text-white"
      >
        <HiOutlineMenu size={24} />
      </button>

      {/* Navigation Items */}
      <div className="flex flex-col space-y-4">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;

          return (
            <motion.div
              key={index}
              initial={false}
              animate={{
                width: isExpanded ? 160 : 56,
                backgroundColor: isActive ? "#2563EB" : "#9CA3AF", // Active = primary
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center cursor-pointer overflow-hidden rounded-full shadow-lg text-white"
              onClick={() => router.push(item.path)}
            >
              <div className="flex items-center justify-center w-14 h-14 text-xl">
                {item.icon}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 font-semibold whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
