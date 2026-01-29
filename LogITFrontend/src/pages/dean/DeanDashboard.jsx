import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";

function DeanDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r z-40">
        <SideBar />
      </aside>

      {/* Sidebar Mobile */}
      <aside className="lg:hidden">
        <SideBar />
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <Header />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Dynamic Pages */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DeanDashboard;
