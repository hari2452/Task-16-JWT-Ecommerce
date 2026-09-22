import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";
import api from "../api";

const AuthContext = createContext();


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // =====================================================
  // CHECK USER
  // Restore logged-in user when React starts / refreshes
  // =====================================================
  const checkUser = async () => {

    const accessToken =
      localStorage.getItem("access_token");

    const refreshToken =
      localStorage.getItem("refresh_token");


    // No tokens = user is not logged in
    if (!accessToken && !refreshToken) {

      setUser(null);
      setLoading(false);
      return;
    }


    try {

      // api.js automatically attaches access token
      const response =
        await api.get("/api/me");

      setUser(response.data.user);

    } catch (error) {

      console.log(
        "User check failed:",
        error
      );

      setUser(null);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // RUN ONCE WHEN REACT STARTS
  // =====================================================
  useEffect(() => {

    checkUser();

  }, []);


  // =====================================================
  // LOGIN
  // Receive JWT tokens and save them
  // =====================================================
  const login = async (email, password) => {

    const response =
      await api.post("/api/login", {
        email,
        password,
      });


    const {
      access_token,
      refresh_token,
      user,
    } = response.data;


    // Save ACCESS token
    localStorage.setItem(
      "access_token",
      access_token
    );


    // Save REFRESH token
    localStorage.setItem(
      "refresh_token",
      refresh_token
    );


    // Save logged-in user
    setUser(user);


    return response.data;
  };


  // =====================================================
  // LOGOUT
  //
  // 1. Revoke ACCESS token
  // 2. Revoke REFRESH token
  // 3. Remove tokens from LocalStorage
  // 4. Clear user state
  // =====================================================
  const logout = async () => {

    // Get tokens BEFORE removing them
    const accessToken =
      localStorage.getItem("access_token");

    const refreshToken =
      localStorage.getItem("refresh_token");


    // ===================================================
    // STEP 1 - REVOKE ACCESS TOKEN
    // ===================================================

    if (accessToken) {

      try {

        // api.js automatically sends access token
        await api.post("/api/logout");

        console.log(
          "Access token revoked successfully"
        );

      } catch (error) {

        console.log(
          "Access token logout error:",
          error.response?.data || error.message
        );

      }
    }


    // ===================================================
    // STEP 2 - REVOKE REFRESH TOKEN
    // ===================================================

    if (refreshToken) {

      try {

        // IMPORTANT:
        // Use normal axios here.
        //
        // Do NOT use our api.js instance because
        // api.js automatically attaches access_token.
        //
        // This endpoint specifically requires
        // the REFRESH token.

        await axios.post(
          "http://localhost:5000/api/logout/refresh",
          {},
          {
            headers: {
              Authorization:
                `Bearer ${refreshToken}`,
            },
          }
        );


        console.log(
          "Refresh token revoked successfully"
        );

      } catch (error) {

        console.log(
          "Refresh token logout error:",
          error.response?.data || error.message
        );

      }
    }


    // ===================================================
    // STEP 3 - REMOVE BOTH TOKENS
    // ===================================================

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );


    // ===================================================
    // STEP 4 - CLEAR USER
    // ===================================================

    setUser(null);

  };


  // =====================================================
  // AUTH CONTEXT
  // =====================================================
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


// =====================================================
// CUSTOM AUTH HOOK
// =====================================================
export function useAuth() {

  return useContext(AuthContext);

}