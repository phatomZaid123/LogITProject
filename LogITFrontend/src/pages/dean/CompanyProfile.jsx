import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const CompanyProfile = () => {
  const { companyId } = useParams();
  const { api } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!companyId) return;
      try {
        setLoading(true);
        const response = await api.get(`/dean/company/${companyId}/profile`);
        setProfile(response.data);
        setError("");
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to load company profile";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [companyId, api]);

  const stats = profile?.stats || {};
  const company = profile?.company;
  const students = profile?.students || [];

  const summaryCards = useMemo(
    () => [
      {
        label: "Assigned Interns",
        value: stats.totalStudents || 0,
        icon: Users,
        accent: "bg-purple-50 text-purple-700",
      },
      {
        label: "Completed",
        value: stats.completedStudents || 0,
        icon: CheckCircle2,
        accent: "bg-green-50 text-green-700",
      },
      {
        label: "Hours Logged",
        value: `${(stats.totalHoursLogged || 0).toFixed(1)}h`,
        icon: Clock,
        accent: "bg-indigo-50 text-indigo-700",
      },
      {
        label: "Avg Progress",
        value: `${(stats.averageProgress || 0).toFixed(1)}%`,
        icon: TrendingUp,
        accent: "bg-amber-50 text-amber-700",
      },
    ],
    [stats],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow rounded-xl p-8 text-center">
          <p className="text-red-500 font-semibold mb-4">
            {error || "Company not found"}
          </p>
          <Link
            to="/dean/dashboard/companies"
            className="inline-flex items-center gap-2 text-purple-600 font-semibold"
          >
            <ArrowLeft size={18} /> Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  const isSuspended = Boolean(company.isSuspended);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 px-8 py-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/dean/dashboard/companies"
              className="inline-flex items-center gap-2 text-sm text-purple-100 hover:text-white mb-4"
            >
              <ArrowLeft size={16} /> Back to Companies
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 rounded-full p-3">
                <Building2 className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{company.name}</h1>
                <p className="text-purple-100 flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-purple-200" />
                  {company.company_address}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                isSuspended
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isSuspended ? "Suspended" : "Active Partner"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 mt-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
              >
                <div className={`p-3 rounded-lg ${card.accent}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={18} className="text-purple-600" /> Company
              Details
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-purple-500" />
                <span>{company.company_address || "No address provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-purple-500" />
                <a
                  href={`mailto:${company.email}`}
                  className="text-purple-600 hover:underline"
                >
                  {company.email}
                </a>
              </div>
              {company.contact_number && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-purple-500" />
                  <a
                    href={`tel:${company.contact_number}`}
                    className="text-purple-600 hover:underline"
                  >
                    {company.contact_number}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                Primary Contact
              </p>
              <p className="text-base font-semibold text-gray-900">
                {company.contact_person?.name || "Not provided"}
              </p>
              <p className="text-sm text-gray-500">
                {company.job_title || "Supervisor"}
              </p>
              <a
                href={`mailto:${company.contact_person?.email}`}
                className="text-sm text-purple-600 hover:underline"
              >
                {company.contact_person?.email}
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-purple-600" /> Assigned
                Interns
              </h2>
              <span className="text-sm text-gray-500">
                {students.length} active placements
              </span>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No students have been assigned to this company yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Admission #</th>
                      <th className="px-4 py-3 text-center">Hours</th>
                      <th className="px-4 py-3 text-center">Progress</th>
                      <th className="px-4 py-3 text-center">Last Entry</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student) => {
                      const progress = Math.min(
                        Math.max(student.progress || 0, 0),
                        100,
                      );
                      return (
                        <tr key={student._id} className="text-gray-700">
                          <td className="px-4 py-3">
                            <Link
                              to={`/dean/dashboard/studentprofile/${student._id}`}
                              className="text-purple-600 font-semibold hover:underline"
                            >
                              {student.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3">{student.student_course}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">
                            {student.student_admission_number}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <p className="font-semibold text-gray-900">
                              {(student.renderedHours || 0).toFixed(1)}h
                            </p>
                            <p className="text-xs text-gray-500">
                              Req: {student.ojt_hours_required || 500}h
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="w-32 mx-auto">
                              <div className="h-2 rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full ${
                                    progress >= 100
                                      ? "bg-green-500"
                                      : progress >= 75
                                        ? "bg-blue-500"
                                        : progress >= 50
                                          ? "bg-yellow-500"
                                          : "bg-purple-500"
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {progress.toFixed(1)}%
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {formatDate(student.lastEntry)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                student.completed_program
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {student.completed_program
                                ? "Completed"
                                : "In Progress"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">
              Activity will appear once students start logging timesheets.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.slice(0, 4).map((student) => (
                <div
                  key={student._id}
                  className="border border-gray-100 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last entry: {formatDate(student.lastEntry)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {(student.renderedHours || 0).toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
