"use client";

import { ReactNode } from "react";
import Navigation from "./Navigation";



export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Navigation /> {/* Always visible */}
      <main className="ml-0 md:ml-20 lg:ml-44 p-8">{children}</main>
    </div>
  );
}
