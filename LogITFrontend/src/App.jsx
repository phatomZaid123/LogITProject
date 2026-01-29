import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DeanLogin from "./pages/dean/DeanLogin.jsx";
import DeanDashboard from "./pages/dean/DeanDashboard.jsx";
import StudentLogin from "./pages/students/StudentLogin.jsx";
import StudentDashboard from "./pages/students/StudentDashboard.jsx";
import StudentRegistration from "./pages/students/StudentRegistration.jsx";
import CompanyLogin from "./pages/company/CompanyLogin.jsx";
import CompanyDashboard from "./pages/company/CompanyDashboard.jsx";
import CompanyComplains from "./pages/dean/CompanyComplains.jsx";
import DashboardHome from "./pages/dean/DashboardHome.jsx";
import StudentReport from "./pages/dean/StudentReport.jsx";
import CompanyRegistration from "./pages/company/CompanyRegistration.jsx";
import StudentList from "./pages/dean/StudentList.jsx";
import DeanReports from "./pages/dean/DeanReports.jsx";
import CompanyList from "./pages/dean/CompanyList.jsx";
import DeanSettings from "./pages/dean/DeanSettings.jsx";
import StudentLogbook from "./pages/students/StudentLogbook.jsx";
import StudentTimesheet from "./pages/students/StudentTimesheet.jsx";
import StudentTasks from "./pages/students/StudentTasks.jsx";
import StudentReports from "./pages/students/StudentReports.jsx";
import StudentHome from "./pages/students/StudentHome.jsx";
import CompanyEmployees from "./pages/company/CompanyInterns.jsx";
import CompanyTasks from "./pages/company/CompanyTasks.jsx";
import CompanyReports from "./pages/company/CompanyReports.jsx";
import CompanySettings from "./pages/company/CompanySettings.jsx";
import CompanyHome from "./pages/company/CompanyHome.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import RequireRole from "./components/ProtectedRoutes.jsx";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StudentProfile from "./components/Profile.jsx";

function App() {
  const queryClient = new QueryClient();
  const routes = createBrowserRouter([
    //Public Routess
    {
      path: "/",
      element: <StudentLogin />,
      errorElement: <div>404 Error! Page not found!</div>,
    },
    {
      path: "/student/login",
      element: <StudentLogin />,
    },
    {
      path: "/register/student",
      element: <StudentRegistration />,
    },

    {
      path: "/dean/login",
      element: <DeanLogin />,
    },
    {
      path: "/company/login",
      element: <CompanyLogin />,
    },
    {
      path: "/register/company",
      element: <CompanyRegistration />,
    },

    // --- PROTECTED ROUTES ---

    // Dean Routes (Only "dean" allowed)
    {
      element: <RequireRole allowedRoles={["dean"]} />,
      children: [
        {
          path: "/dean/dashboard",
          element: <DeanDashboard />,
          children: [
            {
              index: true,
              element: <DashboardHome />,
            },
            {
              path: "students",
              element: <StudentList />,
            },
            {
              path: "companies",
              element: <CompanyList />,
            },
            {
              path: "reports",
              element: <DeanReports />,
            },
            {
              path: "complaints",
              element: <CompanyComplains />,
            },
            {
              path: "settings",
              element: <DeanSettings />,
            },
            {
              path: "companycomplains",
              element: <CompanyComplains />,
            },
            {
              path: "studentreport",
              element: <StudentReport />,
            },
            {
              path: "studentprofile/:id",
              element: <StudentProfile />,
            },
          ],
        },
      ],
    },

    // Student Routes (Only "student" allowed)
    {
      element: <RequireRole allowedRoles={["student"]} />,
      children: [
        {
          path: "/student/dashboard",
          element: <StudentDashboard />,
          children: [
            {
              index: true,
              element: <StudentHome />,
            },
            {
              path: "logbook",
              element: <StudentLogbook />,
            },
            {
              path: "timesheet",
              element: <StudentTimesheet />,
            },
            {
              path: "tasks",
              element: <StudentTasks />,
            },
            {
              path: "reports",
              element: <StudentReports />,
            },
          ],
        },
      ],
    },

    // Company Routes (Only "company" allowed)
    {
      element: <RequireRole allowedRoles={["company"]} />,
      children: [
        {
          path: "/company/dashboard",
          element: <CompanyDashboard />,
          children: [
            {
              index: true,
              element: <CompanyHome />,
            },
            {
              path: "interns",
              element: <CompanyEmployees />,
            },
            {
              path: "tasks",
              element: <CompanyTasks />,
            },
            {
              path: "reports",
              element: <CompanyReports />,
            },
            {
              path: "settings",
              element: <CompanySettings />,
            },
          ],
        },
      ],
    },

    // Shared Routes (Both Dean and Company can view a specific report)
    {
      element: <RequireRole allowedRoles={["dean", "company"]} />,
      children: [
        { path: "/view-report/:id", element: <div>Shared Report View</div> },
      ],
    },
  ]);

  return (
    <>
      <div className="mx-auto min-h-screen">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={routes} />
          </AuthProvider>
        </QueryClientProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
          }}
        />
      </div>
    </>
  );
}

export default App;
