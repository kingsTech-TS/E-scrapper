"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { FaBookOpen, FaBook } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";

const navItems = [
  { label: "DOAJ", path: "/doaj", icon: <FaBook /> },
  { label: "DOAB", path: "/doab", icon: <FaBook /> },
  { label: "OPENALEX", path: "/open-alex", icon: <FaBook /> },
  { label: "OAPEN", path: "/oapen", icon: <FaBook /> },
];

export default function Navigation() {
  // states
  const [expanded, setExpanded] = useState(false); // labels + icons
  const [iconsOnly, setIconsOnly] = useState(false); // icons only
  const [hovered, setHovered] = useState(false); // temporary expand on hover
  const [bounce, setBounce] = useState(false); // bounce idle toggle

  const controls = useAnimation();
  const router = useRouter();
  const pathname = usePathname();

  const collapseTimerRef = useRef<number | null>(null);
  const iconCollapseTimerRef = useRef<number | null>(null);

  // Clear timers safely
  const clearTimers = (reset = false) => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    if (iconCollapseTimerRef.current) clearTimeout(iconCollapseTimerRef.current);

    collapseTimerRef.current = null;
    iconCollapseTimerRef.current = null;

    if (reset) {
      setExpanded(false);
      setIconsOnly(false);
      setBounce(false);
    }
  };

  // Auto-collapse stages
  const startTimers = () => {
    clearTimers();
    setBounce(false); // stop bounce on activity

    // After 10s → collapse to icons only
    collapseTimerRef.current = window.setTimeout(() => {
      setExpanded(false);
      setIconsOnly(true);

      // After 5s more → collapse fully & bounce
      iconCollapseTimerRef.current = window.setTimeout(() => {
        setIconsOnly(false);
        setBounce(true);
      }, 5000);
    }, 10000);
  };

  const handleToggle = () => {
    setExpanded(true);
    setIconsOnly(false);
    setBounce(false);
    startTimers();
  };

  // cleanup on unmount
  useEffect(() => {
    return () => clearTimers(true);
  }, []);

  // Bounce animation
  useEffect(() => {
    if (bounce) {
      controls
        .start({
          y: [0, -4, 0],
          transition: { repeat: 5, duration: 0.7 }, // bounce 5 times
        })
        .then(() => {
          // restart bounce after idle delay
          setTimeout(() => setBounce(true), 8000);
        });
    } else {
      controls.start({ y: 0 });
    }
  }, [bounce, controls]);

  // Computed visual state
  const isExpanded = expanded || hovered;
  const showIcons = isExpanded || iconsOnly;

  return (
    <div
      className="fixed top-1/2 -translate-y-1/2 left-2 sm:left-4 z-50 flex flex-col items-start"
      onMouseEnter={() => {
        setHovered(true);
        setBounce(false);
        startTimers();
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      {/* Toggle Button */}
      <motion.button
        aria-label="Expand navigation"
        aria-expanded={isExpanded}
        onClick={handleToggle}
        className="mb-6 p-3 rounded-full bg-primary hover:bg-primary/90 transition shadow text-white"
        animate={controls}
      >
        <HiOutlineMenu size={24} />
      </motion.button>

      {/* Navigation Items */}

      <div className="flex flex-col space-y-4">
        {showIcons &&
          navItems.map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <motion.button
                key={index}
                type="button"
                role="link"
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  clearTimers(true);
                  router.push(item.path);
                  startTimers();
                }}
                className="flex items-center overflow-hidden rounded-full shadow-lg text-white cursor-pointer"
                initial={false}
                animate={{
                  width: isExpanded ? 160 : 56,
                  backgroundColor: isActive ? "#353535" : "#9CA3AF",
                }}
                transition={{ duration: 0.3 }}
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
              </motion.button>
            );
          })}
      </div>
    </div>
  );
}
