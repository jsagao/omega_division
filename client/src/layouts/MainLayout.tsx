import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../component/Navbar";

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-navy-900 text-slate-200 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-navy-600 py-8 px-4">
        <div className="mx-auto max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span className="font-mono tracking-wider text-gold/60">OMEGA DIVISION</span>
          <span>&copy; {new Date().getFullYear()} Omega Division. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
