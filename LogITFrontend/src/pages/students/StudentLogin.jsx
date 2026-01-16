import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogITLogo from "../../assets/LogITLogo.jpeg";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
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

    // login returns { success, message } based on our previous context code
    const result = await login(email, password);

    console.log(result);
    if (result.success) {
      setLoading(false);
      navigate("/StudentDashboard");
    } else {
      setError(result.error || "Invalid Credentials");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-purple-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-md rounded-lg w-96"
      >
        <div className=" flex justify-center mb-4 bg-purple-500 p-2 rounded-lg ">
          <img
            className="bg-blue-500 rounded-full size-28"
            src={LogITLogo}
            alt="LogIT Logo"
          />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-900">
          Student Login-LogIT
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Email Address</label>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-800 text-white p-2 rounded hover:bg-purple-700"
        >
          {loading ? "Processing" : "Student LogIn"}
        </button>
      </form>
    </div>
  );
};

export default Login;
