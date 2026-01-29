import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  FileText,
  Download,
  Filter,
  X,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

function StudentReport() {
  const [filters, setFilters] = useState({
    year: "",
    status: "",
    searchTerm: "",
    sortBy: "date",
  });


  // Mock data - Replace with API call
  const mockReports = [
    {
      id: 1,
      studentName: "Ahmed Hassan",
      admissionNumber: "BS-2021-001",
      batch: "2021/2022",
      year: 3,
      company: "TechCorp",
      reportDate: "2024-01-10",
      status: "submitted",
      title: "Internship Progress Report",
      score: 85,
    },
    {
      id: 2,
      studentName: "Fatima Khan",
      admissionNumber: "BS-2022-045",
      batch: "2022/2023",
      year: 2,
      company: "StartupX",
      reportDate: "2024-01-12",
      status: "pending",
      title: "Monthly Performance Update",
      score: null,
    },
    {
      id: 3,
      studentName: "Ali Ahmed",
      admissionNumber: "BS-2021-078",
      batch: "2021/2022",
      year: 3,
      company: "InfoSolutions",
      reportDate: "2024-01-08",
      status: "reviewed",
      title: "Final Internship Report",
      score: 92,
    },
    {
      id: 4,
      studentName: "Zainab Malik",
      admissionNumber: "BS-2023-012",
      batch: "2023/2024",
      year: 1,
      company: "WebDev Inc",
      reportDate: "2024-01-15",
      status: "submitted",
      title: "First Month Report",
      score: 78,
    },
    {
      id: 5,
      studentName: "Hassan Ali",
      admissionNumber: "BS-2022-089",
      batch: "2022/2023",
      year: 2,
      company: "DigitalAgency",
      reportDate: "2024-01-11",
      status: "pending",
      title: "Quarterly Assessment",
      score: null,
    },
  ];

  // Filter and sort reports
  const filteredReports = mockReports
    .filter((report) => {
      const matchesYear =
        !filters.year || report.year === parseInt(filters.year);
      const matchesStatus = !filters.status || report.status === filters.status;
      const matchesSearch =
        !filters.searchTerm ||
        report.studentName
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        report.admissionNumber
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        report.company.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return matchesYear && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "date":
          return new Date(b.reportDate) - new Date(a.reportDate);
        case "name":
          return a.studentName.localeCompare(b.studentName);
        case "score":
          return (b.score || 0) - (a.score || 0);
        default:
          return 0;
      }
    });

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: FileText,
        label: "Submitted",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "Pending Review",
      },
      reviewed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Reviewed",
      },
    };
    const config = statusConfig[status] || statusConfig.submitted;
    const IconComponent = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  const handleClearFilters = () => {
    setFilters({
      year: "",
      status: "",
      searchTerm: "",
      sortBy: "date",
    });
  };

  const stats = [
    {
      label: "Total Reports",
      value: mockReports.length,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Pending Review",
      value: mockReports.filter((r) => r.status === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Reviewed",
      value: mockReports.filter((r) => r.status === "reviewed").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Average Score",
      value: (
        mockReports
          .filter((r) => r.score)
          .reduce((sum, r) => sum + r.score, 0) /
        mockReports.filter((r) => r.score).length
      ).toFixed(1),
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div>StudentReport</div>
  )
}

export default StudentReport