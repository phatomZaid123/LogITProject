import { Building2, MapPin, Mail, User, Phone } from "lucide-react";
import Button from "./ui/Button";

function CompanyList({ companies = [], loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Building2 size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No Companies Found
        </h3>
        <p className="text-gray-500 text-center">
          There are no registered companies at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Grid View for larger screens, List for mobile */}
      <div className="hidden lg:grid grid-cols-1 2xl:grid-cols-2 gap-6">
        {companies.map((company) => (
          <div
            key={company._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden"
          >
            {/* Card Header with company name */}
            <div className="bg-linear-to-r from-purple-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {company.name || "N/A"}
                  </h3>
                </div>
                <div className="shrink-0 bg-purple-100 p-2 rounded-lg">
                  <Building2 size={20} className="text-purple-600" />
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm text-gray-900 truncate">
                    {company.email || "N/A"}
                  </p>
                </div>
              </div>
              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">
                    {company.company_address || "N/A"}
                  </p>
                </div>
              </div>
              {/* Supervisor Info */}
              <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Student Supervisor
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">
                      {company.contact_person?.name || "N/A"}
                    </span>
                    {company.job_title && (
                      <span className="text-xs text-gray-600 ml-2">
                        ({company.job_title})
                      </span>
                    )}
                  </div>
                  {company.contact_person?.email && (
                    <div className="flex items-center gap-2 ml-4">
                      <Mail size={14} className="text-indigo-600" />
                      <a
                        href={`mailto:${company.contact_person.email}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {company.contact_person.email}
                      </a>
                    </div>
                  )}
                  {company.contact_person?.contact && (
                    <div className="flex items-center gap-2 ml-4">
                      <Phone size={14} className="text-indigo-600" />
                      <span className="text-sm text-gray-900">
                        {company.contact_person.contact}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline">Suspend Comapany</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile List View */}
      <div className="lg:hidden space-y-4">
        {companies.map((company) => (
          <div
            key={company._id}
            className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Building2
                  size={18}
                  className="text-purple-600 mt-0.5 shrink-0"
                />
                <h3 className="font-bold text-gray-900 flex-1">
                  {company.name || "N/A"}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-indigo-600 shrink-0" />
                <span className="text-gray-600 truncate">
                  {company.email || "N/A"}
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                <span className="text-gray-600">
                  {company.company_address || "N/A"}
                </span>
              </div>

              <div className="bg-green-50 rounded p-3 border border-green-100">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                  Supervisor
                </p>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-green-600 shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    {company.contact_person?.name || "N/A"}
                  </span>
                </div>
                {company.job_title && (
                  <p className="text-xs text-gray-600 mt-1 ml-6">
                    {company.job_title}
                  </p>
                )}
                {company.contact_person?.email && (
                  <p className="text-xs text-indigo-600 mt-1 ml-6">
                    {company.contact_person.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompanyList;
