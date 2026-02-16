import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LogITLogo from "../assets/LogITLogo.jpeg";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const { api } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResetLink("");

    try {
      const response = await api.post("/auth/users/forgot-password", { email });
      if (response.data?.resetLink) {
        setResetLink(response.data.resetLink);
      }
      toast.success("If the email exists, a reset link was created.");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Failed to request reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-100 via-indigo-100 to-purple-200 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl">
          <div className="mb-6 flex justify-center">
            <div className="bg-linear-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <img
                className="h-20 w-20 rounded-full border-4 border-white object-cover"
                src={LogITLogo}
                alt="LogIT Logo"
              />
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Forgot password
            </h2>
            <p className="text-sm text-gray-600">
              Enter your email to receive a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
              />
            </div>

            {resetLink && (
              <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-xs text-purple-700">
                <p className="font-semibold">Reset link (dev):</p>
                <a
                  href={resetLink}
                  className="break-all text-purple-600 underline"
                >
                  {resetLink}
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 py-3 font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-purple-600 hover:text-purple-700"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
