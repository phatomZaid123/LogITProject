import { useState, useEffect } from "react";
import { useSearchParams, useNavigate,Link } from "react-router-dom";

import { Building2, Mail, Lock, MapPin, User, Briefcase } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CompanyRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { api } = useAuth();

  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPassword: "",
    companyAddress: "",
    companyContactPersonName: "",
    companyContactPersonEmail: "",
    jobTittle: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError(
        "No invitation token found. Please ask your Dean for a valid link.",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        companyPassword: formData.companyPassword,
        companyAddress: formData.companyAddress,
        companyContactPersonName: formData.companyContactPersonName,
        companyContactPersonEmail: formData.companyContactPersonEmail,
        jobTittle: formData.jobTittle,
        token: token,
      };

      await api.post("/auth/users/companies/register", payload);

      alert("Registration Successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-green-100">
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-green-900">
            Company Registration
          </h2>
          <p className="text-gray-500 mt-2">
            Register your company to start recruiting via LogIT
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Information Section */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Company Information
            </h3>

            {/* Company Name */}
            <div className="relative mb-4">
              <Building2
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Company Email */}
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                name="companyEmail"
                placeholder="Company Email"
                value={formData.companyEmail}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Company Password */}
            <div className="relative mb-4">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                name="companyPassword"
                placeholder="Password"
                value={formData.companyPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Company Address */}
            <div className="relative mb-4">
              <MapPin
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                name="companyAddress"
                placeholder="Company Address"
                value={formData.companyAddress}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact Person Section */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Contact Person Details
            </h3>

            {/* Contact Person Name */}
            <div className="relative mb-4">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                name="companyContactPersonName"
                placeholder="Contact Person Name"
                value={formData.companyContactPersonName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Contact Person Email */}
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                name="companyContactPersonEmail"
                placeholder="Contact Person Email"
                value={formData.companyContactPersonEmail}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Job Title */}
            <div className="relative mb-4">
              <Briefcase
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                name="jobTittle"
                placeholder="Job Title (e.g., HR Manager, IT Director)"
                value={formData.jobTittle}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? "Registering..." : "Register Company"}
          </button>

          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{" "}
            <Link to="/CompanyLogin" className="text-green-600 hover:text-green-700 font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistration;
