import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API_URL from "../config/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // CHECK AUTHENTICATION
  // =====================================================

  const checkAuth = async () => {
    try {
      setLoading(true);

      // =================================================
      // FIRST: CHECK USER
      // =================================================

      const userResponse = await fetch(
        `${API_URL}/users/profile`,
        {
          method: "GET",

          // Browser automatically sends HTTP-only cookie
          credentials: "include",
        }
      );

      if (userResponse.ok) {
        const userData =
          await userResponse.json();

        console.log(
          "Logged in user:",
          userData
        );

        setUser(
          userData.user || userData
        );

        // User logged in
        setCaptain(null);

        return;
      }

      // User not logged in
      setUser(null);

      // =================================================
      // SECOND: CHECK CAPTAIN
      // =================================================

      const captainResponse = await fetch(
        `${API_URL}/captain/profile`,
        {
          method: "GET",

          // Browser automatically sends HTTP-only cookie
          credentials: "include",
        }
      );

      if (captainResponse.ok) {
        const captainData =
          await captainResponse.json();

        console.log(
          "Logged in captain:",
          captainData
        );

        setCaptain(
          captainData.captain ||
          captainData
        );

        // Captain logged in
        setUser(null);

      } else {
        // Nobody logged in
        setCaptain(null);
      }

    } catch (error) {
      console.error(
        "Authentication check error:",
        error
      );

      setUser(null);
      setCaptain(null);

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // CHECK AUTH WHEN APP LOADS / REFRESHES
  // =====================================================

  useEffect(() => {
    checkAuth();
  }, []);


  // =====================================================
  // USER LOGIN
  // =====================================================

  const login = async (
    email,
    password
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/users/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          // Important:
          // Allows browser to receive/store
          // HTTP-only authentication cookie
          credentials: "include",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "User login response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.errors?.[0]?.msg ||
          "Login failed"
        );
      }

      // Backend already sets:
      // res.cookie("token", token, ...)
      //
      // Browser stores the cookie automatically.
      // We don't need localStorage.

      setUser(
        data.user || data
      );

      // User and captain cannot
      // be logged in simultaneously
      setCaptain(null);

      return data;

    } catch (error) {
      console.error(
        "User login error:",
        error
      );

      throw error;
    }
  };


  // =====================================================
  // CAPTAIN LOGIN
  // =====================================================

  const captainLogin = async (
    email,
    password
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/captain/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          // Important:
          // Allows browser to receive/store
          // HTTP-only authentication cookie
          credentials: "include",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Captain login response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.errors?.[0]?.msg ||
          "Captain login failed"
        );
      }

      // Backend sets the HTTP-only cookie.
      // Browser automatically stores it.

      setCaptain(
        data.captain || data
      );

      // Clear user
      setUser(null);

      return data;

    } catch (error) {
      console.error(
        "Captain login error:",
        error
      );

      throw error;
    }
  };


  // =====================================================
  // USER LOGOUT
  // Backend:
  // GET /users/logout
  // =====================================================

  const logout = async () => {
    try {
      const response = await fetch(
        `${API_URL}/users/logout`,
        {
          method: "GET",

          // Sends HTTP-only token cookie
          // to backend
          credentials: "include",
        }
      );

      const data =
        await response.json();

      console.log(
        "User logout response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          "User logout failed"
        );
      }

      // Backend clears token cookie
      setUser(null);

      // Safety
      setCaptain(null);

    } catch (error) {
      console.error(
        "User logout error:",
        error
      );

      throw error;
    }
  };


  // =====================================================
  // CAPTAIN LOGOUT
  // Backend:
  // POST /captain/logout
  // =====================================================

  const captainLogout = async () => {
    try {
      const response = await fetch(
        `${API_URL}/captain/logout`,
        {
          method: "POST",

          // Sends HTTP-only token cookie
          // to backend
          credentials: "include",
        }
      );

      const data =
        await response.json();

      console.log(
        "Captain logout response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Captain logout failed"
        );
      }

      // Backend clears token cookie
      setCaptain(null);

      // Safety
      setUser(null);

    } catch (error) {
      console.error(
        "Captain logout error:",
        error
      );

      throw error;
    }
  };


  // =====================================================
  // AUTH CONTEXT PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        // =========================
        // USER
        // =========================

        user,
        setUser,

        login,
        logout,

        // =========================
        // CAPTAIN
        // =========================

        captain,
        setCaptain,

        captainLogin,
        captainLogout,

        // =========================
        // COMMON
        // =========================

        loading,

        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// =====================================================
// CUSTOM AUTH HOOK
// =====================================================

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;