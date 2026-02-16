import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";

import Button from "../../components/ui/Button";

import {
  Users,
  Building2,
  CheckCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  User2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import DeanChatbot from "../../components/DeanChatbot";

function DashboardHome() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const summaryRef = useRef(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsRes = await api.get("/dean/dashboard/stats");
        setStats(statsRes.data);
        console.log("Dashboard Stats:", statsRes.data);

        const studentsRes = await api.get("/dean/getAllStudents");
        const students = studentsRes.data?.students || [];

        const completionQueue = students
          .filter(
            (student) =>
              !student.completed_program &&
              Number(student.ojt_hours_remaining || 0) <= 0,
          )
          .slice(0, 8)
          .map((student) => ({
            id: student._id,
            student: student.name || "Unknown",
            admissionNumber: student.student_admission_number || "N/A",
            approvedHours: Number(student.ojt_hours_completed || 0),
            requiredHours: Number(student.ojt_hours_required || 500),
          }));

        setPendingItems(completionQueue);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [api]);

  useEffect(() => {
    if (isSummaryOpen && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isSummaryOpen]);

  // KPI Stats with real data
  const kpiStats = stats
    ? [
        {
          title: "Total Students",
          value: stats.students.total,
          subtitle: `${stats.students.active} Active`,
          icon: Users,
          color: "bg-blue-100 text-blue-600",
        },
        {
          title: "Partner Companies",
          value: stats.companies.total,
          subtitle: `${stats.companies.active} Active`,
          icon: Building2,
          color: "bg-green-100 text-green-600",
        },
        {
          title: "Not Assigned to OJT",
          value: stats.students.unassigned,
          icon: User2,
          color: "bg-amber-100 text-amber-600",
          highlight: stats.students.unassigned > 0,
        },
        {
          title: "Completed OJT",
          value: stats.students.completed,
          subtitle: "This Batch",
          icon: CheckCircle,
          color: "bg-purple-100 text-purple-600",
        },
        {
          title: "Active Batch",
          value: stats.activeBatch.session_name,
          subtitle: stats.activeBatch.year,
          icon: Calendar,
          color: "bg-indigo-100 text-indigo-600",
          isText: true,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className=" bg-purple-600  rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Dean Dashboard</h1>
        <p className="text-purple-100 text-lg">
          On-the-Job Training (OJT) Program Monitoring System
        </p>
        <p className="text-sm text-purple-50 mt-2">
          Details about the current Batch
        </p>
      </div>

      {/* KPI Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} elevated className="animate-pulse">
              <CardContent padding="sm">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} elevated>
                <CardContent padding="sm" className="relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p
                    className={`${stat.isText ? "text-xl" : "text-3xl"} font-bold text-gray-900 mb-1`}
                  >
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Get summaries"
          count="Chat"
          icon={BookOpen}
          color="bg-purple-500"
          onClick={() => setIsSummaryOpen((prev) => !prev)}
        />
      </div>

      {isSummaryOpen && (
        <div ref={summaryRef}>
          <DeanChatbot
            isOpen={isSummaryOpen}
            onClose={() => setIsSummaryOpen(false)}
          />
        </div>
      )}

      {/* Completion Review Table */}
      <Card elevated className="shadow-lg">
        <CardHeader withBorder className="bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={24} />
                Ready for Completion Review
              </CardTitle>
              <CardDescription>
                Students who completed required OJT hours
              </CardDescription>
            </div>
            {pendingItems.length > 0 && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate("/dean/dashboard/students")}
              >
                View Students
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent padding="none">
          {loading ? (
            <div className="p-10 text-center animate-pulse text-gray-400">
              Loading pending items...
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <CheckCircle className="mx-auto mb-3 text-green-500" size={48} />
              <p className="font-medium">No completion requests yet</p>
              <p className="text-sm">
                Students will appear here once they reach required hours.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Approved Hours
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.student}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.admissionNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.approvedHours.toFixed(1)} /{" "}
                        {item.requiredHours.toFixed(1)} h
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            navigate(
                              `/dean/dashboard/studentprofile/${item.id}`,
                            )
                          }
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Action Card Component
const QuickActionCard = ({ title, count, icon: Icon, color, onClick }) => (
  <Card
    elevated
    className="hover:shadow-lg transition-all cursor-pointer group"
    onClick={onClick}
  >
    <CardContent padding="sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
        <div
          className={`p-4 rounded-lg ${color} text-white group-hover:scale-110 transition-transform`}
        >
          <Icon size={24} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default DashboardHome;
