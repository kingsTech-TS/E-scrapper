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
  // labels + icons
  const [expanded, setExpanded] = useState(false);
  // just icons
  const [iconsOnly, setIconsOnly] = useState(false);
  // hover-driven temporary expansion (doesn't mutate 'expanded')
  const [hovered, setHovered] = useState(false);
  // bounce the toggle after 2nd collapse stage
  const [bounce, setBounce] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const collapseTimerRef = useRef<number | null>(null);
  const iconCollapseTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    if (iconCollapseTimerRef.current) clearTimeout(iconCollapseTimerRef.current);
    collapseTimerRef.current = null;
    iconCollapseTimerRef.current = null;
  };

  // Start two-stage auto-collapse (10s -> icons only, +5s -> toggle only + bounce)
  const startTimers = () => {
    clearTimers();
    setBounce(false); // user just interacted; stop bouncing

    // After 10s → collapse to icons only
    collapseTimerRef.current = window.setTimeout(() => {
      setExpanded(false);
      setIconsOnly(true);

      // After 5s → collapse to only toggle + start bounce
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

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Compute visual states (hover expands without mutating 'expanded')
  const isExpanded = expanded || hovered;
  const showIcons = isExpanded || iconsOnly;

  return (
    <div
      className="fixed top-1/4 left-2 sm:left-4 z-50 flex flex-col items-start"
      onMouseEnter={() => {
        setHovered(true);      // expand visually while hovering
        setBounce(false);      // stop bounce when user engages
        startTimers();         // restart inactivity countdown
      }}
      onMouseLeave={() => {
        setHovered(false);     // revert to underlying stage on leave
      }}
    >
      {/* Toggle Button */}
      <motion.button
        aria-label="Expand navigation"
        aria-expanded={isExpanded}
        onClick={handleToggle}
        className="mb-6 p-3 rounded-full bg-primary hover:bg-primary/90 transition shadow text-white"
        // Bounce only after second-stage collapse
        animate={bounce ? { y: [0, -4, 0] } : { y: 0 }}
        transition={bounce ? { repeat: Infinity, repeatType: "reverse", duration: 0.7 } : {}}
      >
        <HiOutlineMenu size={24} />
      </motion.button>

      {/* Navigation Items */}
      <div className="flex flex-col space-y-4">
        {showIcons &&
          navItems.map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  width: isExpanded ? 160 : 56,
                  backgroundColor: isActive ? "#353535" : "#9CA3AF",
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center cursor-pointer overflow-hidden rounded-full shadow-lg text-white"
                onClick={() => {
                  // Navigate and fully close the rail immediately; stop timers & bounce
                  clearTimers();
                  setBounce(false);
                  setExpanded(false);
                  setIconsOnly(false);
                  router.push(item.path);
                }}
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
