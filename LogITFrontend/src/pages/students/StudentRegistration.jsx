import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { UserPlus, BookOpen, Hash, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const StudentRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { api } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    admission_number: "",
    course: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError(
        "No invitation token found. Please ask your Dean for a valid link."
      );
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="p-8 bg-white shadow-xl rounded-lg text-center border-t-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Link</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        admission_number: formData.admission_number,
        student_course: formData.course,
        token: token,
      };

      await api.post("/auth/users/students/register", payload);

      alert("Registration Successful! You can now log in.");
      navigate("/student/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. The link might be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
        <div className="text-center mb-8">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-purple-900">
            Student Sign Up
          </h2>
          <p className="text-gray-500 mt-2">
            Join your Internship Batch via LogIT
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Added autoComplete="off" to help with the port error */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserPlus
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Institutional Email"
              value={formData.email}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="relative">
            <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Admission Number (e.g. 2021-001)"
              value={formData.admission_number}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, admission_number: e.target.value })
              }
              required
            />
          </div>

          <div className="relative">
            <BookOpen
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Course (e.g. BSCS)"
              value={formData.course}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, course: e.target.value })
              }
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Create Password"
              value={formData.password}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all 
              ${
                loading
                  ? "bg-gray-400"
                  : "bg-purple-600 hover:bg-purple-700 shadow-lg"
              }`}
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
