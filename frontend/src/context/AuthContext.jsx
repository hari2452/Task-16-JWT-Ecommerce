import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  const checkUser = async () => {

    try {

      const response = await api.get("/api/me");

      setUser(response.data.user);

    } catch (error) {

      setUser(null);

    } finally {

      setLoading(false);

    }
  };


  // Run once when React starts
  useEffect(() => {

    checkUser();

  }, []);


  // Login
  const login = async (email, password) => {

    const response = await api.post("/api/login", {
      email,
      password,
    });

    setUser(response.data.user);

    return response.data;
  };


  // Logout
  const logout = async () => {

    await api.get("/api/logout");

    setUser(null);
  };


  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkUser,
      }}
    >

      {children}

    </AuthContext.Provider>

  );
}


export function useAuth() {

  return useContext(AuthContext);
}