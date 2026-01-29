
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FileText, Download } from "lucide-react";

function StudentLogbook() {
  const entries = [
    {
      id: 1,
      date: "Jan 15, 2024",
      hours: 8,
      description: "Completed database design for project X",
      status: "approved",
    },
    {
      id: 2,
      date: "Jan 16, 2024",
      hours: 8,
      description: "Implemented API endpoints for user module",
      status: "approved",
    },
    {
      id: 3,
      date: "Jan 17, 2024",
      hours: 6,
      description: "Testing and bug fixes",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Logbook</h1>
        <p className="text-gray-600">Track and manage your OJT hours.</p>
      </div>

      {/* Summary Card */}
      <Card elevated>
        <CardContent padding="lg">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Total Hours</p>
              <p className="text-3xl font-bold text-gray-900">120</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600">104</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-amber-600">16</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logbook Entries */}
      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Logbook Entries</CardTitle>
          <CardDescription>All your submitted entries</CardDescription>
        </CardHeader>
        <CardContent padding="none">
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{entry.date}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {entry.hours}h
                    </p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        entry.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="primary">
          <FileText size={18} className="mr-2" /> Add Entry
        </Button>
        <Button variant="outline">
          <Download size={18} className="mr-2" /> Export
        </Button>
      </div>
    </div>
  );
}

export default StudentLogbook;
