import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  const IsUserLoggedIn = async () => {
    try {
      const response = await api.get("/auth/users/me");
      setUser(response.data.user);
    } catch (error) {
      console.log("No valid session found");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //check if user is already loggedin and mount user
  useEffect(() => {
    IsUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/users/login", {
        email,
        password,
      });
      console.log(response);
      setUser(response.data.user);
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/users/logout");
      if (user?.role === "dean") {
        window.location.href = "/dean/login";
      } else if (user?.role === "student") {
        window.location.href = "/student/login";
      } else if (user?.role === "company") {
        window.location.href = "/company/login";
      } 
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, api }}>
      {!loading ? children : <div>Loading LogIT...</div>}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export const useAuth = () => useContext(AuthContext);
