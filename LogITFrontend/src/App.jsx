import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DeanLogin from "./pages/dean/DeanLogin.jsx";
import DeanDashboard from "./pages/dean/DeanDashboard.jsx";
import StudentLogin from "./pages/students/StudentLogin.jsx";
import StudentDashboard from "./pages/students/StudentDashboard.jsx";
import CompanyLogin from "./pages/company/CompanyLogin.jsx";
import CompanyDashboard from "./pages/company/CompanyDashboard.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import RequireRole from "./components/ProtectedRoutes.jsx";
import { Toaster } from "react-hot-toast";
function App() {
  const routes = createBrowserRouter([
    //Public Routess
    {
      path: "/",
      element: <StudentLogin />,
      errorElement: <div>404 Error! Page not found!</div>,
    },

    {
      path: "/DeanLogin",
      element: <DeanLogin />,
    },
    {
      path: "/CompanyLogin",
      element: <CompanyLogin />,
    },

    // --- PROTECTED ROUTES ---

    // Dean Routes (Only "dean" allowed)
    {
      element: <RequireRole allowedRoles={["dean"]} />,
      children: [{ path: "/DeanDashboard", element: <DeanDashboard /> }],
    },

    // Student Routes (Only "student" allowed)
    {
      element: <RequireRole allowedRoles={["student"]} />,
      children: [{ path: "/StudentDashboard", element: <StudentDashboard /> }],
    },

    //Company Routes (Only "company" allowed)
    {
      element: <RequireRole allowedRoles={["company"]} />,
      children: [{ path: "/CompanyDashboard", element: <CompanyDashboard /> }],
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
      <div className="mx-auto min-h-screen ">
        <AuthProvider>
          <RouterProvider router={routes} />
        </AuthProvider>
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
