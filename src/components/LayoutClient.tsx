"use client";

import { ReactNode } from "react";
import Navigation from "./Navigation";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaChevronRight, FaHome } from "react-icons/fa";

function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const paths = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
      <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
        <FaHome className="w-3 h-3" /> Home
      </Link>
      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

        return (
          <div key={path} className="flex items-center gap-2">
            <FaChevronRight className="w-2 h-2 text-slate-300" />
            {isLast ? (
              <span className="font-semibold text-slate-900 dark:text-white">
                {label}
              </span>
            ) : (
              <Link href={href} className="hover:text-indigo-600 transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Toaster position="top-right" />
      <Navigation />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>
      
      <main className="relative z-10 pt-16 min-h-screen transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}
