import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogITLogo from "../assets/LogITLogo.jpeg";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const UnifiedLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        const userRole = result.user?.role;

        // Route users to their respective dashboards based on their role
        switch (userRole) {
          case "dean":
            navigate("/dean/dashboard");
            toast.success(`Welcome back, ${result.user.name}`);
            break;
          case "student":
            navigate("/student/dashboard");
            toast.success(`Welcome back, ${result.user.name}`);
            break;
          case "company":
            navigate("/company/dashboard");
            toast.success(`Welcome back, ${result.user.name}`);
            break;
          default:
            setError("Invalid user role");
            toast.error("Invalid user role");
        }
      } else {
        setError(result.error || "Invalid Credentials");
        toast.error(result.error || "Invalid Credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-purple-100 via-indigo-100 to-purple-200">
      <div className="w-full max-w-md px-4">
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white shadow-2xl rounded-2xl border border-gray-100"
        >
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="bg-linear-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <img
                className="rounded-full w-24 h-24 object-cover border-4 border-white"
                src={LogITLogo}
                alt="LogIT Logo"
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to LogIT
            </h2>
            <p className="text-gray-600 text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Registration Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm mb-3">
              Don't have an account?
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="/register/student"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline"
              >
                Register as Student
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="/register/company"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline"
              >
                Register as Company
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedLogin;
