import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";

function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-40">
        <SideBar>
          <div />
        </SideBar>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <SideBar>
          <div />
        </SideBar>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Fixed Header */}
        <div className="sticky top-0 z-30">
          <Header />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet context={{ defaultContent: "home" }} />
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
