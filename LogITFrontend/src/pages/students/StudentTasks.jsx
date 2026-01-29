import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";

import Button from "../../components/ui/Button";

import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Calendar,
  BarChart2,
} from "lucide-react";

function StudentTasks() {
  /* Sample Data From Company */
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Build Authentication System",
      description: "Develop login, registration, and role access",
      company: "TechCorp Ltd",
      supervisor: "Mr. Daniels",
      dueDate: "2024-01-20",
      expectedHours: 25,
      progress: 60,
      status: "in-progress",
      feedback: "",
    },

    {
      id: 2,
      title: "Database Design",
      description: "Create ER diagram and MongoDB collections",
      company: "TechCorp Ltd",
      supervisor: "Mr. Daniels",
      dueDate: "2024-01-18",
      expectedHours: 15,
      progress: 100,
      status: "completed",
      feedback: "Good structure. Well done.",
    },

    {
      id: 3,
      title: "API Documentation",
      description: "Document all endpoints",
      company: "TechCorp Ltd",
      supervisor: "Mr. Daniels",
      dueDate: "2024-01-25",
      expectedHours: 10,
      progress: 0,
      status: "pending",
      feedback: "",
    },
  ]);

  /* Update Progress */
  const updateProgress = (id, value) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              progress: value,
              status: value === 100 ? "completed" : "in-progress",
            }
          : task,
      ),
    );
  };

  /* Status Color */
  const statusColor = {
    completed: "bg-green-100 text-green-700",
    "in-progress": "bg-blue-100 text-blue-700",
    pending: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assigned Tasks</h1>

        <p className="text-gray-600">
          Tasks assigned by your company supervisor
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-5">
        {tasks.map((task) => (
          <Card key={task.id} elevated>
            <CardContent padding="lg">
              <div className="space-y-4">
                {/* Title + Status */}
                <div className="flex flex-col md:flex-row justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {task.title}
                    </h3>

                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>

                  <span
                    className={`self-start px-3 py-1 rounded-full text-sm font-medium ${statusColor[task.status]}`}
                  >
                    {task.status === "completed" && (
                      <CheckCircle2 size={14} className="inline mr-1" />
                    )}

                    {task.status}
                  </span>
                </div>

                {/* Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Due: {task.dueDate}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    Expected: {task.expectedHours}h
                  </div>

                  <div>Company: {task.company}</div>

                  <div>Supervisor: {task.supervisor}</div>
                </div>

                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={task.progress}
                    disabled={task.status === "completed"}
                    onChange={(e) =>
                      updateProgress(task.id, Number(e.target.value))
                    }
                    className="w-full accent-purple-600"
                  />
                </div>

                {/* Supervisor Feedback */}
                {task.feedback && (
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                      <MessageSquare size={14} />
                      Supervisor Feedback
                    </div>

                    <p className="text-sm text-gray-600">{task.feedback}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-3 border-t">
                  <Button variant="outline" size="sm">
                    Log Hours
                  </Button>

                  <Button variant="outline" size="sm">
                    Add Note
                  </Button>

                  {task.status !== "completed" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateProgress(task.id, 100)}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StudentTasks;
