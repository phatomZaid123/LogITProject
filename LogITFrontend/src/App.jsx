import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UnifiedLogin from "./pages/UnifiedLogin.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import DeanDashboard from "./pages/dean/DeanDashboard.jsx";
import StudentDashboard from "./pages/students/StudentDashboard.jsx";
import StudentRegistration from "./pages/students/StudentRegistration.jsx";
import CompanyDashboard from "./pages/company/CompanyDashboard.jsx";
import CompanyComplains from "./pages/dean/CompanyComplains.jsx";
import DashboardHome from "./pages/dean/DashboardHome.jsx";
import StudentReport from "./pages/dean/StudentReport.jsx";
import CompanyRegistration from "./pages/company/CompanyRegistration.jsx";
import StudentList from "./pages/dean/StudentList.jsx";

import CompanyList from "./pages/dean/CompanyList.jsx";
import DeanSettings from "./pages/dean/DeanSettings.jsx";
import Aluminis from "./pages/dean/Aluminis.jsx";
import AlumniBatchDetails from "./pages/dean/AlumniBatchDetails.jsx";
import StudentLogbook from "./pages/students/StudentLogbook.jsx";
import StudentTimesheet from "./pages/students/StudentTimesheet.jsx";

import StudentReports from "./pages/students/StudentReports.jsx";
import StudentHome from "./pages/students/StudentHome.jsx";
import StudentSettings from "./pages/students/StudentSettings.jsx";
import CompanyEmployees from "./pages/company/CompanyInterns.jsx";

import CompanyReports from "./pages/company/CompanyReports.jsx";
import ComplainToDean from "./pages/company/ComplainToDean.jsx";
import CompanySettings from "./pages/company/CompanySettings.jsx";
import CompanyHome from "./pages/company/CompanyHome.jsx";
import CompanyInternProfile from "./pages/company/CompanyInternProfile.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import RequireRole from "./components/ProtectedRoutes.jsx";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StudentProfile from "./components/Profile.jsx";
import CompanyProfile from "./pages/dean/CompanyProfile.jsx";

function App() {
  const queryClient = new QueryClient();
  const routes = createBrowserRouter([
    //Public Routes - All use unified login
    {
      path: "/",
      element: <UnifiedLogin />,
      errorElement: <div>404 Error! Page not found!</div>,
    },
    {
      path: "/login",
      element: <UnifiedLogin />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "/register/student",
      element: <StudentRegistration />,
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
              path: "alumini",
              element: <Aluminis />,
            },
            {
              path: "alumini/:batchId",
              element: <AlumniBatchDetails />,
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
            {
              path: "companyprofile/:companyId",
              element: <CompanyProfile />,
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
              path: "reports",
              element: <StudentReports />,
            },
            {
              path: "profile",
              element: <StudentSettings />,
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
              path: "interns/:studentId",
              element: <CompanyInternProfile />,
            },

            {
              path: "reports",
              element: <CompanyReports />,
            },
            {
              path: "complaints",
              element: <ComplainToDean />,
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
