import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../component/Navbar";

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
