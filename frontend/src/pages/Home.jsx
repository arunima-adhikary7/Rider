import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();

  // =====================================================
  // GET AUTH DATA FROM AUTH CONTEXT
  // =====================================================

  const {
    user,
    captain,
    loading,
    logout,
    captainLogout,
  } = useAuth();

  // =====================================================
  // LOCAL STATE
  // =====================================================

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // USER LOGOUT
  // =====================================================

  const handleUserLogout = async () => {
    try {
      setLogoutLoading(true);
      setError("");

      await logout();

      navigate("/");
    } catch (error) {
      console.error("User Logout Error:", error);

      setError(
        error.message || "User logout failed. Please try again."
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  // =====================================================
  // CAPTAIN LOGOUT
  // =====================================================

  const handleCaptainLogout = async () => {
    try {
      setLogoutLoading(true);
      setError("");

      await captainLogout();

      navigate("/");
    } catch (error) {
      console.error("Captain Logout Error:", error);

      setError(
        error.message || "Captain logout failed. Please try again."
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  // =====================================================
  // USER NAME
  // =====================================================

  const userName =
    user?.fullname?.firstname ||
    user?.fullname?.firstName ||
    "User";

  // =====================================================
  // CAPTAIN NAME
  // =====================================================

  const captainName =
    captain?.fullname?.firstname ||
    captain?.fullname?.firstName ||
    "Captain";

  // =====================================================
  // HOME PAGE
  // =====================================================

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* ================================================= */}
      {/* BACKGROUND IMAGE */}
      {/* ================================================= */}

      <img
        src="https://images.unsplash.com/photo-1557404763-69708cd8b9ce?q=80&w=1600&auto=format&fit=crop"
        alt="City traffic"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* ================================================= */}
      {/* DARK OVERLAY */}
      {/* ================================================= */}

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="relative z-20 flex h-20 items-center justify-between px-6 text-white md:px-12 lg:px-16">

        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <Link
          to="/"
          className="text-3xl font-bold tracking-tight"
        >
          Rider
        </Link>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav className="hidden items-center gap-8 md:flex">

          {/* RIDE */}

          <Link
            to={user ? "/ride" : "/login"}
            className="text-sm font-medium transition hover:text-gray-300"
          >
            Ride
          </Link>

          {/* DRIVE */}

          <Link
            to={captain ? "/captain-dashboard" : "/captain-login"}
            className="text-sm font-medium transition hover:text-gray-300"
          >
            Drive
          </Link>

          {/* BUSINESS */}

          <a
            href="#"
            className="text-sm font-medium transition hover:text-gray-300"
          >
            Business
          </a>

          {/* ABOUT */}

          <a
            href="#"
            className="text-sm font-medium transition hover:text-gray-300"
          >
            About
          </a>

        </nav>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div className="flex items-center gap-3">

          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading ? (

            <span className="text-sm text-white/70">
              Loading...
            </span>

          ) : captain ? (

            /* =================================================
               CAPTAIN LOGGED IN
            ================================================= */

            <div className="flex items-center gap-3">

              {/* CAPTAIN NAME */}

              <span className="hidden text-sm font-medium sm:block">
                Hi, {captainName}
              </span>

              {/* DASHBOARD */}

              <Link
                to="/captain-dashboard"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Dashboard
              </Link>

              {/* LOGOUT */}

              <button
                onClick={handleCaptainLogout}
                disabled={logoutLoading}
                className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {logoutLoading ? "Logging out..." : "Log out"}
              </button>

            </div>

          ) : user ? (

            /* =================================================
               USER LOGGED IN
            ================================================= */

            <div className="flex items-center gap-3">

              {/* USER NAME */}

              <span className="hidden text-sm font-medium sm:block">
                Hi, {userName}
              </span>

              {/* BOOK RIDE */}

              <Link
                to="/ride"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Book a Ride
              </Link>

              {/* LOGOUT */}

              <button
                onClick={handleUserLogout}
                disabled={logoutLoading}
                className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {logoutLoading ? "Logging out..." : "Log out"}
              </button>

            </div>

          ) : (

            /* =================================================
               NO USER / NO CAPTAIN
            ================================================= */

            <div className="flex items-center gap-3">

              {/* LOGIN */}

              <Link
                to="/login"
                className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:bg-white/15"
              >
                Log in
              </Link>

              {/* SIGN UP */}

              <Link
                to="/signup"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Sign up
              </Link>

            </div>

          )}

        </div>
      </header>

      {/* ================================================= */}
      {/* ERROR MESSAGE */}
      {/* ================================================= */}

      {error && (
        <div className="absolute right-6 top-24 z-30 max-w-sm rounded-lg border border-red-300 bg-white px-5 py-3 text-sm text-red-600 shadow-lg md:right-12">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* HERO CONTENT */}
      {/* ================================================= */}

      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center px-6 md:px-12 lg:px-16">

        <div className="max-w-2xl text-white">

          {/* HEADING */}

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Go anywhere.
            <br />
            Get there.
          </h1>

          {/* DESCRIPTION */}

          <p className="mt-7 max-w-xl text-base leading-relaxed text-gray-200 md:text-lg">
            Request a ride and get where you need to go.
            Fast, reliable, and available whenever you need it.
          </p>

          {/* ================================================= */}
          {/* HERO BUTTONS */}
          {/* ================================================= */}

          <div className="mt-9 flex flex-wrap gap-4">

            {/* =================================================
               MAIN ACTION
            ================================================= */}

            {captain ? (

              <Link
                to="/captain-dashboard"
                className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-lg transition hover:-translate-y-1 hover:bg-gray-100"
              >
                Go to Dashboard
              </Link>

            ) : user ? (

              <Link
                to="/ride"
                className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-lg transition hover:-translate-y-1 hover:bg-gray-100"
              >
                Book a Ride
              </Link>

            ) : (

              <Link
                to="/login"
                className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-lg transition hover:-translate-y-1 hover:bg-gray-100"
              >
                Get a Ride
              </Link>

            )}

            {/* =================================================
               SECONDARY ACTION
            ================================================= */}

            {captain ? (

              <Link
                to="/captain-dashboard"
                className="rounded-full border border-white/70 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                Captain Dashboard
              </Link>

            ) : (

              <Link
                to="/captain-login"
                className="rounded-full border border-white/70 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                Drive with Rider
              </Link>

            )}

          </div>

        </div>
      </main>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <div className="absolute bottom-6 left-6 right-6 z-20 md:left-12 md:right-12 lg:left-16 lg:right-16">

        <p className="text-xs text-white/60">
          © 2026 Rider. All rights reserved.
        </p>

      </div>

    </div>
  );
};

export default Home;