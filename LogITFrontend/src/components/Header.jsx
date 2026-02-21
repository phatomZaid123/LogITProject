import { Bell, Settings, LogOut, User, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Notification from "./Notification";
import { useNavigate } from "react-router-dom";
import LogITLogo from "../assets/LogITLogo.jpeg";

function Header() {
  const { logout, user, api } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  const profileImageSrc = user?.profile_image
    ? `http://localhost:5000${user.profile_image}`
    : LogITLogo;

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error("Fetch unread notification count error:", error);
    }
  }, [api]);

  const fetchNotifications = useCallback(async () => {
    setIsNotificationsLoading(true);
    try {
      const response = await api.get("/notifications", {
        params: { limit: 10 },
      });
      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setIsNotificationsLoading(false);
    }
  }, [api]);

  // useEffect(() => {
  //   if (!user) return;

  //   fetchUnreadCount();
  //   const interval = setInterval(fetchUnreadCount, 30000);

  //   return () => clearInterval(interval);
  // }, [fetchUnreadCount, user]);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [fetchNotifications, showNotifications]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification?.isRead) {
        await api.patch(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      if (notification?.link) {
        window.location.href = notification.link;
      }
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
    }
  };

  const getProfileRoute = () => {
    if (user?.role === "student") return "/student/dashboard/profile";
    if (user?.role === "company") return "/company/dashboard/settings";
    if (user?.role === "dean") return "/dean/dashboard/settings";
    return "/";
  };

  const handleGoToProfile = () => {
    navigate(getProfileRoute());
    setShowProfile(false);
  };

  return (
    <header className="sticky top-0 z-30">
      <div className="m-2 rounded-xl border border-gray-200 bg-white/90 backdrop-blur shadow-sm">
        <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Welcome back
            </p>
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                <span className="text-purple-900">Hi,</span>{" "}
                <button
                  type="button"
                  onClick={handleGoToProfile}
                  className="text-purple-700 hover:underline"
                >
                  {user?.name || "User"}
                </button>
              </h1>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase text-purple-700">
                {user?.role || "member"}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Here’s your OJT program overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              {showNotifications && (
                <Notification
                  notifications={notifications}
                  unreadCount={unreadCount}
                  isLoading={isNotificationsLoading}
                  onNotificationClick={handleNotificationClick}
                  onMarkAllRead={handleMarkAllRead}
                />
              )}
            </div>

            <button
              onClick={handleGoToProfile}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50"
            >
              <Settings size={18} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
                <span className="hidden sm:block">{user?.name || "User"}</span>
                <ChevronDown size={16} />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <img
                      src={profileImageSrc}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover border border-gray-200 mb-2"
                    />
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleGoToProfile}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
