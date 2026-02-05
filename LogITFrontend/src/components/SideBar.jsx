import { useState } from "react";

import {
  Menu,
  X,
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

import LogITLogo from "../assets/LogITLogo.jpeg";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SideBar({ children }) {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();

  /* ===== MENU CONFIG ===== */
  const menuItems = {
    student: [
      { label: "Dashboard", path: "/student/dashboard", icon: Home },
      {
        label: "My Logbook",
        path: "/student/dashboard/logbook",
        icon: FileText,
      },
      { label: "Timesheet", path: "/student/dashboard/timesheet", icon: Clock },
      { label: "Tasks", path: "/student/dashboard/tasks", icon: CheckCircle2 },
      { label: "Reports", path: "/student/dashboard/reports", icon: BarChart3 },
    ],

    dean: [
      { label: "Dashboard", path: "/dean/dashboard", icon: Home },
      { label: "Students", path: "/dean/dashboard/students", icon: Users },
      {
        label: "Companies",
        path: "/dean/dashboard/companies",
        icon: Building2,
      },
      { label: "Reports", path: "/dean/dashboard/reports", icon: BarChart3 },
      {
        label: "Complaints",
        path: "/dean/dashboard/complaints",
        icon: AlertCircle,
      },
      { label: "Settings", path: "/dean/dashboard/settings", icon: Settings },
    ],

    company: [
      { label: "Dashboard", path: "/company/dashboard", icon: Home },
      { label: "Interns", path: "/company/dashboard/interns", icon: Users },
      { label: "Tasks", path: "/company/dashboard/tasks", icon: CheckCircle2 },
      { label: "Intern Reports", path: "/company/dashboard/reports", icon: BarChart3 },
      {label: "Complaints", path: "/company/dashboard/complaints", icon: AlertCircle},
      {
        label: "Settings",
        path: "/company/dashboard/settings",
        icon: Settings,
      },
    ],
  };

  const currentMenu = menuItems[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ===== MOBILE BUTTON ===== */}
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed top-4 left-4 z-50 lg:hidden
          p-2 rounded-md bg-purple-600 text-white
          shadow-lg
        "
      >
        {open ? <X /> : <Menu />}
      </button>

      {/* ===== MOBILE OVERLAY ===== */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed lg:relative z-50
          top-0 left-0 h-screen w-64
          bg-slate-900 text-slate-100
          transition-transform duration-300

          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* ===== LOGO ===== */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
            <img
              src={LogITLogo}
              alt="LogIT"
              className="w-10 h-10 rounded-full"
            />

            <div>
              <h1 className="font-bold text-lg">LogIT</h1>
              <p className="text-xs text-slate-400">OJT System</p>
            </div>
          </div>

          {/* ===== USER CARD ===== */}
          <div className="px-6 py-4 border-b border-slate-700">
            <p className="text-xs text-slate-400">Logged in as</p>

            <p className="font-semibold mt-1 capitalize">
              {user?.name || "User"}
            </p>

            <p className="text-xs text-purple-400 capitalize mt-1">
              {user?.role}
            </p>
          </div>

          {/* ===== MENU ===== */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <p className="text-xs text-slate-400 px-3 mb-2">MAIN MENU</p>

            {currentMenu.map((item, i) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={i}
                  to={item.path}
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `
                    group flex items-center gap-3
                    px-4 py-2.5 rounded-lg text-sm
                    transition-all

                    ${
                      isActive
                        ? "bg-purple-600 text-white shadow"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* ===== LOGOUT ===== */}
          <div className="px-3 py-4 border-t border-slate-700">
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="
                w-full flex items-center gap-3
                px-4 py-2.5 rounded-lg
                bg-red-600 hover:bg-red-700
                text-white text-sm font-medium
                transition
              "
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

export default SideBar;
