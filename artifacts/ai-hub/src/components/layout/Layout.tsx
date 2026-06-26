import { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full bg-[#0A0F1C] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]">
        {children}
      </main>
    </div>
  );
}
