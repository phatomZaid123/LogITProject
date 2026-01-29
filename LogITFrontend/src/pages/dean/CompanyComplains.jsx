import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  AlertTriangle,
  Filter,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  Flag,
} from "lucide-react";

function CompanyComplains() {
  const [filters, setFilters] = useState({
    company: "",
    priority: "",
    status: "",
    searchTerm: "",
    sortBy: "date",
  });

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Mock Data
  const mockComplaints = [
    {
      id: 1,
      company: "TechCorp Solutions",
      studentName: "John Russel Bagason",
      admissionNumber: "BSIT-2021-014",
      batch: "2021/2022",
      complainDate: "2024-01-15",
      category: "Attendance",
      subject: "Repeated late arrival to office",
      description:
        "The intern has reported late to duty on five occasions within the last two weeks, affecting team workflow.",
      priority: "high",
      status: "open",
      evidence: "attendance_log_jan.pdf",
      adminResponse: "",
      resolution: "",
    },
    {
      id: 2,
      company: "WebDev Technologies",
      studentName: "Sarah Johnson",
      admissionNumber: "BSIT-2022-032",
      batch: "2022/2023",
      complainDate: "2024-01-13",
      category: "Work Quality",
      subject: "Incomplete project documentation",
      description:
        "Submitted modules lack proper documentation and code comments, making maintenance difficult.",
      priority: "medium",
      status: "in-review",
      evidence: "project_review.png",
      adminResponse:
        "Student advised to revise documentation and follow coding standards.",
      resolution: "",
    },
    {
      id: 3,
      company: "Digital Agency Ltd",
      studentName: "Michael Brown",
      admissionNumber: "BSIT-2021-056",
      batch: "2021/2022",
      complainDate: "2024-01-10",
      category: "Positive Feedback",
      subject: "Outstanding internship performance",
      description:
        "Intern demonstrated excellent problem-solving skills and completed all tasks ahead of schedule.",
      priority: "low",
      status: "resolved",
      evidence: "",
      adminResponse: "Commended student for exemplary performance.",
      resolution: "Student awarded recognition certificate.",
    },
  ];

  /* ---------------- FILTER + SORT ---------------- */

  const filteredComplaints = mockComplaints
    .filter((c) => {
      const matchesCompany = !filters.company || c.company === filters.company;
      const matchesPriority =
        !filters.priority || c.priority === filters.priority;
      const matchesStatus = !filters.status || c.status === filters.status;

      const matchesSearch =
        !filters.searchTerm ||
        c.subject.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.studentName
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(filters.searchTerm.toLowerCase());

      return (
        matchesCompany && matchesPriority && matchesStatus && matchesSearch
      );
    })
    .sort((a, b) => {
      if (filters.sortBy === "date") {
        return new Date(b.complainDate) - new Date(a.complainDate);
      }

      if (filters.sortBy === "priority") {
        const order = { high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }

      if (filters.sortBy === "name") {
        return a.studentName.localeCompare(b.studentName);
      }

      return 0;
    });

  /* ---------------- BADGES ---------------- */

  const getStatusBadge = (status) => {
    const config = {
      open: {
        bg: "bg-red-100 text-red-700",
        icon: AlertTriangle,
        label: "Open",
      },
      "in-review": {
        bg: "bg-yellow-100 text-yellow-700",
        icon: Clock,
        label: "In Review",
      },
      resolved: {
        bg: "bg-green-100 text-green-700",
        icon: CheckCircle,
        label: "Resolved",
      },
    };

    const item = config[status];
    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${item.bg}`}
      >
        <Icon size={14} />
        {item.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: "bg-red-100 text-red-700",
      medium: "bg-orange-100 text-orange-700",
      low: "bg-green-100 text-green-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config[priority]}`}
      >
        {priority.toUpperCase()}
      </span>
    );
  };

  /* ---------------- STATS ---------------- */

  const stats = [
    {
      label: "Total",
      value: mockComplaints.length,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Open",
      value: mockComplaints.filter((c) => c.status === "open").length,
      icon: Flag,
      color: "text-orange-600",
    },
    {
      label: "In Review",
      value: mockComplaints.filter((c) => c.status === "in-review").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Resolved",
      value: mockComplaints.filter((c) => c.status === "resolved").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  const companies = [...new Set(mockComplaints.map((c) => c.company))];

  const clearFilters = () => {
    setFilters({
      company: "",
      priority: "",
      status: "",
      searchTerm: "",
      sortBy: "date",
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Company Complaints
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage company feedback on interns
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.label}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>

                  <Icon size={30} className={stat.color} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FILTERS */}
        <Card className="mb-8">
          <CardHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <h2 className="font-semibold">Filters</h2>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
              {/* SEARCH */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium">Search</label>

                <div className="relative mt-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <input
                    type="text"
                    className="w-full pl-9 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Search..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* COMPANY */}
              <div>
                <label className="text-sm font-medium">Company</label>

                <select
                  className="w-full mt-1 border rounded-lg py-2 px-2"
                  value={filters.company}
                  onChange={(e) =>
                    setFilters({ ...filters, company: e.target.value })
                  }
                >
                  <option value="">All</option>

                  {companies.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* PRIORITY */}
              <div>
                <label className="text-sm font-medium">Priority</label>

                <select
                  className="w-full mt-1 border rounded-lg py-2 px-2"
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters({ ...filters, priority: e.target.value })
                  }
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* STATUS */}
              <div>
                <label className="text-sm font-medium">Status</label>

                <select
                  className="w-full mt-1 border rounded-lg py-2 px-2"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">All</option>
                  <option value="open">Open</option>
                  <option value="in-review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* SORT */}
              <div>
                <label className="text-sm font-medium">Sort</label>

                <select
                  className="w-full mt-1 border rounded-lg py-2 px-2"
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  <option value="date">Date</option>
                  <option value="priority">Priority</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* CLEAR */}
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredComplaints.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:shadow-lg transition border-l-4 border-purple-500"
              onClick={() =>
                setSelectedComplaint(selectedComplaint?.id === c.id ? null : c)
              }
            >
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{c.studentName}</h3>

                    {getStatusBadge(c.status)}
                  </div>

                  {getPriorityBadge(c.priority)}
                </div>

                <h4 className="font-medium">{c.subject}</h4>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {c.description}
                </p>

                <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-1">
                  <span>{c.company}</span>
                  <span>{new Date(c.complainDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DETAILS */}
        {selectedComplaint && (
          <Card className="mt-8">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-2xl font-bold">Complaint Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <Detail label="Student" value={selectedComplaint.studentName} />
                <Detail
                  label="Admission"
                  value={selectedComplaint.admissionNumber}
                />
                <Detail label="Company" value={selectedComplaint.company} />
                <Detail label="Batch" value={selectedComplaint.batch} />
                <Detail label="Category" value={selectedComplaint.category} />
                <Detail
                  label="Date"
                  value={new Date(
                    selectedComplaint.complainDate,
                  ).toLocaleDateString()}
                />
              </div>

              <Detail label="Subject" value={selectedComplaint.subject} />

              <Detail
                label="Description"
                value={selectedComplaint.description}
              />

              {selectedComplaint.evidence && (
                <a className="flex items-center gap-1 text-purple-600 text-sm">
                  <ExternalLink size={14} />
                  View Attachment
                </a>
              )}

              <Detail
                label="Admin Response"
                value={selectedComplaint.adminResponse || "Pending"}
              />

              <Detail
                label="Resolution"
                value={selectedComplaint.resolution || "Not resolved"}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button>Respond</Button>
                <Button variant="outline">Mark Resolved</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* REUSABLE DETAIL COMPONENT */

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

export default CompanyComplains;
