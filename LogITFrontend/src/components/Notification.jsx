import React from "react";

function Notification() {
  /* Activities */
  const recentActivities = [
    {
      type: "Student",
      action: "Submitted final OJT report",
      name: "John Smith",
      time: "2 hours ago",
      status: "pending",
    },
    {
      type: "Company",
      action: "Uploaded performance evaluation",
      name: "TechCorp Ltd",
      time: "4 hours ago",
      status: "completed",
    },
    {
      type: "Student",
      action: "Completed required training hours",
      name: "Sarah Johnson",
      time: "6 hours ago",
      status: "completed",
    },
    {
      type: "Complaint",
      action: "Policy violation reported",
      name: "Attendance Issue",
      time: "8 hours ago",
      status: "urgent",
    },
  ];

  return (
    <>
      {/* Activities */}
      <div className="lg:col-span-2">
        <Card elevated>
          <CardHeader withBorder>
            <CardTitle>Recent Academic Activities</CardTitle>

            <CardDescription>
              Latest updates from students and partner companies
            </CardDescription>
          </CardHeader>

          <CardContent padding="none">
            <div className="divide-y">
              {recentActivities.map((activity, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-2
                        ${
                          activity.status === "urgent"
                            ? "bg-red-500"
                            : activity.status === "pending"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                    />

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">
                          {activity.type}: {activity.action}
                        </p>

                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">{activity.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Notification;
