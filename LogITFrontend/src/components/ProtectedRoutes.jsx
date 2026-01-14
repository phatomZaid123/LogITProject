import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireRole = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log(user);
  //Checking if user is loading...!
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Checking Access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has the correct role
  if (!allowedRoles.includes(user.role)) {
    alert(
      `Access Denied: User role '${user.role} does not previledge to access this page'`
    );

    // Redirect unauthorized users based on their actual role
    if (user.role === "student")
      return <Navigate to="/StudentDashboard" replace />;
    if (user.role === "company")
      return <Navigate to="/CompanyDashboard" replace />;
    if (user.role === "dean") return <Navigate to="/DeanDashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireRole;
