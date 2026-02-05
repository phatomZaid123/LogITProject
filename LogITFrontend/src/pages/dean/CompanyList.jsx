import { useState, useEffect, useMemo } from "react";
import CompanyListComponent from "../../components/CompanyList";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import {
  Filter,
  Building2,
  QrCode,
  Search,
  Users,
  ShieldCheck,
  ShieldOff,
  X,
  MapPin,
  Mail,
  Phone,
  Clock,
  CalendarDays,
} from "lucide-react";
import QRCodeModal from "../../components/QRCodeModal";
import toast from "react-hot-toast";

const deriveStats = (list = []) => {
  const total = list.length;
  const suspended = list.filter((company) => company.isSuspended).length;
  const active = total - suspended;
  const assignments = list.reduce(
    (sum, company) => sum + (company.assignedStudentCount || 0),
    0,
  );

  return { total, active, suspended, assignments };
};

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'suspended'
  const [searchTerm, setSearchTerm] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    assignments: 0,
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState("");
  const { api } = useAuth();

  // Fetch registered companies from backend
  const fetchCompanies = async (status = "all") => {
    try {
      setLoading(true);

      // Use the new endpoint that supports filtering
      const endpoint =
        status === "all"
          ? "/dean/getAllCompany"
          : `/dean/companies/status?status=${status}`;

      const companyDetails = await api.get(endpoint);

      // API returns {company: [...] }
      const companyList = companyDetails.data?.company || [];
      setCompanies(companyList);

      if (status === "all") {
        setAllCompanies(companyList);
        setSummaryStats(deriveStats(companyList));
      } else if (!allCompanies.length) {
        // fallback to ensure stats exist even if "all" hasn't been fetched yet
        setAllCompanies(companyList);
        setSummaryStats(deriveStats(companyList));
      }
    } catch (error) {
      console.error("Error fetching data from backend:", error);
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(statusFilter);
  }, [statusFilter]);

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    const term = searchTerm.trim().toLowerCase();

    return companies.filter((company) => {
      const fields = [
        company.name,
        company.email,
        company.company_address,
        company.contact_person?.name,
      ];

      return fields.some(
        (field) => field && field.toLowerCase().includes(term),
      );
    });
  }, [companies, searchTerm]);

  const visibleAssignments = useMemo(
    () =>
      filteredCompanies.reduce(
        (sum, company) => sum + (company.assignedStudentCount || 0),
        0,
      ),
    [filteredCompanies],
  );

  const isFilteredView = statusFilter !== "all" || Boolean(searchTerm.trim());
  const statusLabel =
    statusFilter === "all" ? "companies" : `${statusFilter} companies`;

  const statCards = [
    {
      label: "Total Companies",
      value: summaryStats.total,
      icon: Building2,
      accent: "bg-purple-50 text-purple-700",
    },
    {
      label: "Active Partners",
      value: summaryStats.active,
      icon: ShieldCheck,
      accent: "bg-green-50 text-green-700",
    },
    {
      label: "Suspended",
      value: summaryStats.suspended,
      icon: ShieldOff,
      accent: "bg-red-50 text-red-700",
    },
    {
      label: "Student Placements",
      value: summaryStats.assignments,
      icon: Users,
      accent: "bg-indigo-50 text-indigo-700",
    },
  ];

  const handleSuspend = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to suspend ${companyName}?`)) {
      return;
    }

    try {
      const response = await api.put(`/dean/company/${companyId}/suspend`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCompanies(statusFilter); // Refresh the list
      }
    } catch (error) {
      console.error("Error suspending company:", error);
      toast.error(error.response?.data?.message || "Failed to suspend company");
    }
  };

  const handleUnsuspend = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to unsuspend ${companyName}?`)) {
      return;
    }

    try {
      const response = await api.put(`/dean/company/${companyId}/unsuspend`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCompanies(statusFilter); // Refresh the list
      }
    } catch (error) {
      console.error("Error unsuspending company:", error);
      toast.error(
        error.response?.data?.message || "Failed to unsuspend company",
      );
    }
  };

  const openCompanyProfile = async (companyId) => {
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileData(null);
    setProfileError("");

    try {
      const response = await api.get(`/dean/company/${companyId}/profile`);
      setProfileData(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch company profile";
      setProfileError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfileModal = () => {
    setProfileOpen(false);
    setProfileData(null);
    setProfileError("");
  };

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const handleGetQRCode = async () => {
    try {
      const response = await api.get("/dean/company/registration/qr");

      if (response.data.success) {
        setQrData(response.data);
        setQrModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch QR code";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="bg-linear-to-b from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={32} />
              <h1 className="text-3xl font-bold">Company Management</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Manage and monitor registered companies
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${card.accent} text-sm`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="w-full">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter size={20} className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "primary" : "outline"}
                onClick={() => setStatusFilter("all")}
                className="text-sm px-3 py-1.5 min-w-fit"
              >
                All ({summaryStats.total})
              </Button>
              <Button
                variant={statusFilter === "active" ? "primary" : "outline"}
                onClick={() => setStatusFilter("active")}
                className="text-sm px-3 py-1.5 min-w-fit"
              >
                Active ({summaryStats.active})
              </Button>
              <Button
                variant={statusFilter === "suspended" ? "primary" : "outline"}
                onClick={() => setStatusFilter("suspended")}
                className="text-sm px-3 py-1.5 min-w-fit"
              >
                Suspended ({summaryStats.suspended})
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredCompanies.length} of {companies.length}{" "}
            {statusLabel} • {visibleAssignments} student placements
          </p>
        </div>
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, supervisor, or email"
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleGetQRCode}
            className="flex items-center gap-2 text-sm px-3 py-2 whitespace-nowrap"
          >
            <QrCode size={18} /> QR Code
          </Button>
        </div>
      </div>

      {/* Company List */}
      <CompanyListComponent
        companies={filteredCompanies}
        loading={loading}
        onSuspend={handleSuspend}
        onUnsuspend={handleUnsuspend}
        onViewProfile={openCompanyProfile}
        isFiltered={isFilteredView}
      />

      {/* Company Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                  Company Profile
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData?.company?.name || "Company"}
                </h2>
                <p className="text-sm text-gray-500">
                  {profileData?.company?.company_address ||
                    "No address provided"}
                </p>
              </div>
              <button
                onClick={closeProfileModal}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {profileLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                    <p className="text-gray-500 text-sm">
                      Loading company details...
                    </p>
                  </div>
                </div>
              ) : profileError ? (
                <div className="text-center py-10 text-red-600 font-semibold">
                  {profileError}
                </div>
              ) : profileData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-100 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Primary Contact
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profileData.company?.contact_person?.name || "N/A"}
                      </p>
                      {profileData.company?.job_title && (
                        <p className="text-sm text-gray-500">
                          {profileData.company.job_title}
                        </p>
                      )}
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-purple-600" />
                          <span>
                            {profileData.company?.contact_person?.email ||
                              "Not provided"}
                          </span>
                        </div>
                        {profileData.company?.contact_person?.contact && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-purple-600" />
                            <span>
                              {profileData.company.contact_person.contact}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Status
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            profileData.company?.isSuspended
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {profileData.company?.isSuspended
                            ? "Suspended"
                            : "Active Partner"}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={14} />
                          <span>
                            {profileData.company?.company_address || "N/A"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Joined on {formatDate(profileData.company?.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Assigned Students",
                        value: profileData.stats?.totalStudents || 0,
                        icon: Users,
                      },
                      {
                        label: "In Progress",
                        value: profileData.stats?.inProgressStudents || 0,
                        icon: CalendarDays,
                      },
                      {
                        label: "Completed",
                        value: profileData.stats?.completedStudents || 0,
                        icon: ShieldCheck,
                      },
                      {
                        label: "Hours Logged",
                        value: `${Number(profileData.stats?.totalHoursLogged || 0).toFixed(1)}h`,
                        icon: Clock,
                      },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={card.label}
                          className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex items-center gap-3"
                        >
                          <div className="p-3 rounded-full bg-white shadow-sm">
                            <Icon size={18} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {card.label}
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              {card.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        Assigned Students
                      </h3>
                      <p className="text-sm text-gray-500">
                        {profileData.stats?.totalStudents || 0} student(s) •
                        Average progress{" "}
                        {profileData.stats?.averageProgress || 0}%
                      </p>
                    </div>
                    {profileData.students?.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                              <th className="px-4 py-3">Student</th>
                              <th className="px-4 py-3">Admission #</th>
                              <th className="px-4 py-3">Course</th>
                              <th className="px-4 py-3">Hours</th>
                              <th className="px-4 py-3">Progress</th>
                              <th className="px-4 py-3">Last Entry</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.students.map((student) => (
                              <tr
                                key={student._id}
                                className="border-t border-gray-100"
                              >
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-gray-900">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {student.email}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {student.student_admission_number || "N/A"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {student.student_course || "N/A"}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-900">
                                  {Number(student.renderedHours || 0).toFixed(
                                    1,
                                  )}
                                  h
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="h-1.5 rounded-full bg-purple-600"
                                        style={{
                                          width: `${Math.min(student.progress || 0, 100)}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">
                                      {student.progress || 0}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {formatDate(student.lastEntry)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8 border border-dashed border-gray-200 rounded-xl">
                        No students are currently assigned to this company.
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && qrData && (
        <QRCodeModal
          onClose={() => setQrModalOpen(false)}
          qrData={qrData}
          title="Company Registration QR Code"
        />
      )}
    </div>
  );
}

export default CompanyList;
