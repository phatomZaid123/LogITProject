const formatTimeAgo = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

function Notification({
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  onMarkAllRead,
  onNotificationClick,
}) {
  return (
    <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
          <p className="text-xs text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You’re all caught up."}
          </p>
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-xs font-medium text-purple-600 hover:text-purple-700"
          disabled={unreadCount === 0}
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-4 text-sm text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => onNotificationClick(item)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                item.isRead ? "bg-white" : "bg-purple-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                {!item.isRead && (
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-purple-600" />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-600 line-clamp-2">{item.message}</p>
              <p className="mt-2 text-[11px] text-gray-400">
                {formatTimeAgo(item.createdAt)}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default Notification;