import { Search, Bell, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { logout, user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <header className="m-2 bg-white border-b border-gray-200 sticky top-0 z-30 rounded-sm shadow-sm mt-0 mb-0">
        <div className="flex items-center justify-between px-3 md:px-8 py-2">
          {/* Left: Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search students, companies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 ml-6">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Settings size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase() || "D"}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name || "Dean"}
                </span>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <User size={16} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfile(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 p-3 bg-gray-50 text-right mr-2 ml-2">
        <div className="flex justify-end items-baseline">
          <h1 className="text-purple-500 text-sm md:text-3xl font-thin">Hi,</h1>
          <span className="pl-2 text-gray-400 text-sm md:text-3xl font-thin">
            {user?.name || "User"}
          </span>
        </div>

        <p className="text-gray-600 text-sm md:text-xs">
          Welcome back! Here's your OJT program overview.
        </p>
      </div>
    </>
  );
}

export default Header;
