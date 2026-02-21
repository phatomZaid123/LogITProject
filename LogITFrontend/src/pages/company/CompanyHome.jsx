import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import { Bell, Clock, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function CompanyHome() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, pendingRes] = await Promise.all([
        api.get("/company/assignedInterns"),
        api.get("/company/pending-approvals"),
      ]);
      setStudents(studentsRes.data || []);
      setPending(pendingRes.data || []);
    } catch (error) {
      console.error("Company dashboard fetch error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const pendingByStudent = useMemo(() => {
    return pending.reduce((acc, item) => {
      const studentId = item?._id?.toString();
      if (!studentId) return acc;
      acc[studentId] = Number(item?.submittedCount || 0);
      return acc;
    }, {});
  }, [pending]);

  const topStudents = useMemo(() => {
    return [...students]
      .sort(
        (a, b) =>
          Number(b?.ojt_hours_completed || 0) -
          Number(a?.ojt_hours_completed || 0),
      )
      .slice(0, 10);
  }, [students]);

  const summary = useMemo(() => {
    const totalStudents = students.length;
    const hoursTracked = students.reduce(
      (sum, student) => sum + (student.ojt_hours_completed || 0),
      0,
    );
    const avgProgress = totalStudents
      ? Math.round(
          (students.reduce((sum, student) => {
            const required = student.ojt_hours_required || 500;
            const completed = student.ojt_hours_completed || 0;
            return sum + (completed / required) * 100;
          }, 0) /
            totalStudents) *
            10,
        ) / 10
      : 0;
    const pendingCount = pending.length;

    return {
      totalStudents,
      hoursTracked,
      avgProgress: Number.isFinite(avgProgress) ? avgProgress : 0,
      pendingCount,
    };
  }, [students, pending]);

  const statCards = [
    {
      title: "Assigned Interns",
      value: summary.totalStudents,
      subtext: `${summary.avgProgress}% avg progress`,
      icon: Users,
      gradient: "from-sky-500 to-blue-600",
    },
    {
      title: "Approved Hours",
      value: `${summary.hoursTracked.toFixed(1)}h`,
      subtext: "Company-approved to date",
      icon: Clock,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Pending Reviews",
      value: summary.pendingCount,
      subtext: "Awaiting company approval",
      icon: Bell,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-linear-to-b from-gray-50 via-white to-blue-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400 font-semibold">
            Company Mission Control
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            OJT Performance Dashboard
          </h1>
          <p className="text-gray-600 max-w-2xl mt-2">
            Get a live snapshot of every intern, their approved hours, pending
            submissions, and overall progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="border-none shadow-lg overflow-hidden"
            >
              <CardContent
                className={`bg-linear-to-br ${card.gradient} text-white p-6`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/70">{card.title}</p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-white/80 mt-1">{card.subtext}</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <Icon size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card elevated>
            <CardHeader withBorder>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Intern Progress Monitor</CardTitle>
                  <CardDescription>
                    Company-approved hours versus requirements (top 10). Click a
                    student to view full profile.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">Student</th>
                      <th className="px-6 py-3 text-left">Progress</th>
                      <th className="px-6 py-3 text-left">Approved Hours</th>
                      <th className="px-6 py-3 text-left">
                        Pending Submissions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-6 text-center text-gray-500"
                        >
                          Fetching students...
                        </td>
                      </tr>
                    ) : topStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-6 text-center text-gray-500"
                        >
                          No interns are assigned to your company yet.
                        </td>
                      </tr>
                    ) : (
                      topStudents.map((student) => {
                        const required = student.ojt_hours_required || 500;
                        const completed = student.ojt_hours_completed || 0;
                        const progress = Math.min(
                          100,
                          Math.round((completed / required) * 100) || 0,
                        );
                        const pendingCount =
                          pendingByStudent[student._id?.toString()] || 0;

                        return (
                          <tr
                            key={student._id}
                            className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                            onClick={() =>
                              navigate(
                                `/company/dashboard/interns/${student._id}`,
                              )
                            }
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">
                                {student.name}
                              </div>
                              <p className="text-xs text-gray-500">
                                {student.student_course || "Program"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-28 bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-linear-to-r from-blue-500 to-purple-500 h-2"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span>{progress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900 font-medium">
                                {completed.toFixed(1)}h
                              </div>
                              <p className="text-xs text-gray-500">
                                {required}h required
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                {pendingCount}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CompanyHome;
