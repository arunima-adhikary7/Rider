import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserLogin = () => {
  const navigate = useNavigate();

  // Get login function from AuthContext
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error when user starts typing
    setError("");
  };

  // ================= HANDLE LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Call login function from AuthContext
      await login(
        formData.email,
        formData.password
      );

      console.log("Login successful");

      // Redirect to home
      navigate("/");

    } catch (error) {
      console.error("Login Error:", error);

      setError(
        error.message ||
        "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ================= NAVBAR ================= */}
      <header className="flex h-20 items-center justify-between border-b border-gray-200 px-6 md:px-12">

        {/* Rider Logo */}
        <Link
          to="/"
          className="text-3xl font-bold tracking-tight text-black"
        >
          Rider
        </Link>

        {/* Signup */}
        <div className="flex items-center gap-3">

          <span className="hidden text-sm text-gray-600 sm:block">
            Don't have an account?
          </span>

          <Link
            to="/signup"
            className="rounded-full border border-black px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            Sign up
          </Link>

        </div>

      </header>


      {/* ================= LOGIN SECTION ================= */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4 py-12">

        <div className="grid w-full max-w-5xl overflow-hidden bg-white shadow-xl md:grid-cols-2">


          {/* ================= LEFT SIDE ================= */}
          <div className="hidden bg-black p-10 text-white md:flex md:flex-col md:justify-between lg:p-14">

            <div>

              {/* Logo */}
              <div className="mb-10 text-3xl font-bold">
                Rider
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Welcome
                <br />
                back.
              </h1>

              <p className="mt-6 max-w-sm leading-relaxed text-gray-400">
                Log in to your Rider account and get back
                on the road. Your next journey is just a
                few clicks away.
              </p>

            </div>


            {/* Bottom */}
            <div className="mt-16">

              <div className="mb-4 h-px w-full bg-gray-800" />

              <p className="text-sm text-gray-500">
                Ride anywhere. Go everywhere.
              </p>

            </div>

          </div>


          {/* ================= RIGHT SIDE ================= */}
          <div className="p-6 sm:p-10 lg:p-14">

            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-3xl font-bold text-black">
                Log in to Rider
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter your details to continue
              </p>

            </div>


            {/* ================= ERROR MESSAGE ================= */}
            {error && (
              <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}


            {/* ================= LOGIN FORM ================= */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-black">
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm outline-none transition focus:border-black"
                />

              </div>


              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="block text-sm font-medium text-black">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-gray-600 hover:text-black"
                  >
                    Forgot password?
                  </button>

                </div>


                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full border border-gray-300 px-4 py-3.5 pr-20 text-sm outline-none transition focus:border-black"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-black"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* Remember Me */}
              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  className="h-4 w-4 accent-black"
                />

                <span className="text-sm text-gray-600">
                  Remember me
                </span>

              </div>


              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading
                  ? "Logging in..."
                  : "Log in"}
              </button>

            </form>


            {/* Divider */}
            <div className="my-8 flex items-center gap-4">

              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs text-gray-400">
                OR
              </span>

              <div className="h-px flex-1 bg-gray-200" />

            </div>


            {/* Google Login */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 border border-gray-300 py-3.5 text-sm font-medium transition hover:bg-gray-50"
            >
              <span className="font-bold">
                G
              </span>

              Continue with Google
            </button>


            {/* Signup Link */}
            <p className="mt-8 text-center text-sm text-gray-500">

              Don't have a Rider account?{" "}

              <Link
                to="/signup"
                className="font-semibold text-black underline"
              >
                Sign up
              </Link>

            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default UserLogin;