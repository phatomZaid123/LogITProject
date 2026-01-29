import { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { CheckCircle2, Plus, Filter, Calendar } from "lucide-react";
import AssignTaskModal from "../../components/AssignTaskModal";

function CompanyTasks() {
  const [openModal, setOpenModal] = useState(false);

  const tasks = [
    {
      id: 1,
      title: "Student Project Assignment",
      description: "Assign new project to John Smith",
      dueDate: "Jan 20, 2024",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      title: "Performance Evaluation",
      description: "Complete mid-term evaluation",
      dueDate: "Jan 18, 2024",
      status: "completed",
      priority: "high",
    },
    {
      id: 3,
      title: "Skills Assessment",
      description: "Assess student technical skills",
      dueDate: "Jan 25, 2024",
      status: "in-progress",
      priority: "medium",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">
            Assign, track and manage student tasks
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Filter size={18} className="mr-2" />
            Filter
          </Button>

          <Button variant="primary" onClick={() => setOpenModal(true)}>
            <Plus size={18} className="mr-2" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} elevated className="hover:shadow-lg transition">
            <CardContent padding="lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{task.title}</h3>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium
                      ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm">{task.description}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />

                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>

                {/* Right */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium
                    ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : task.status === "in-progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {task.status === "completed" && <CheckCircle2 size={14} />}

                    {task.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <AssignTaskModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
}

export default CompanyTasks;
