import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // CHECK AUTHENTICATION
  // =====================================================

  const checkAuth = async () => {
    setLoading(true);

    try {
      // Check USER and CAPTAIN at the same time
      const [userResponse, captainResponse] =
        await Promise.all([
          fetch("http://localhost:3000/users/profile", {
            method: "GET",
            credentials: "include",
          }),

          fetch("http://localhost:3000/captain/profile", {
            method: "GET",
            credentials: "include",
          }),
        ]);

      // =================================================
      // CHECK USER
      // =================================================

      if (userResponse.ok) {
        const userData = await userResponse.json();

        console.log("Logged in user:", userData);

        setUser(
          userData.user || userData
        );
      } else {
        setUser(null);
      }

      // =================================================
      // CHECK CAPTAIN
      // =================================================

      if (captainResponse.ok) {
        const captainData =
          await captainResponse.json();

        console.log(
          "Logged in captain:",
          captainData
        );

        setCaptain(
          captainData.captain || captainData
        );
      } else {
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
  // RUN AUTH CHECK WHEN APP STARTS
  // =====================================================

  useEffect(() => {
    checkAuth();
  }, []);


  // =====================================================
  // USER LOGIN
  // =====================================================

  const login = async (email, password) => {
    const response = await fetch(
      "http://localhost:3000/users/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

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

    // Set logged-in user
    setUser(
      data.user || data
    );

    // User and captain should not be active together
    setCaptain(null);

    return data;
  };


  // =====================================================
  // CAPTAIN LOGIN
  // =====================================================

  const captainLogin = async (
    email,
    password
  ) => {
    const response = await fetch(
      "http://localhost:3000/captain/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

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

    // Set logged-in captain
    setCaptain(
      data.captain || data
    );

    // User and captain should not be active together
    setUser(null);

    return data;
  };


  // =====================================================
  // USER LOGOUT
  // Backend:
  // GET /users/logout
  // =====================================================

  const logout = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/users/logout",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

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

      // Remove user from frontend state
      setUser(null);

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
        "http://localhost:3000/captain/logout",
        {
          // IMPORTANT:
          // Backend route is POST
          method: "POST",

          credentials: "include",
        }
      );

      const data = await response.json();

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

      // Remove captain from frontend state
      setCaptain(null);

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

        // Manual authentication check
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