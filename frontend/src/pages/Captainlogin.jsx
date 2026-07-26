import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CaptainLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= HANDLE INPUT CHANGE =================
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
      const response = await fetch(
        "http://localhost:3000/captain/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          // Important for HTTP-only authentication cookie
          credentials: "include",

          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      console.log("Captain Login Response:", data);

      // Backend error
      if (!response.ok) {
        setError(
          data.message ||
            data.errors?.[0]?.msg ||
            "Login failed. Please try again."
        );

        return;
      }

      // Login successful
      console.log("Captain login successful");

      // If you want to save token manually:
      // localStorage.setItem("token", data.token);

      // Redirect after successful login
      navigate("/captain-home");

    } catch (error) {
      console.error("Captain Login Error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
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
            Want to drive with Rider?
          </span>

          <Link
            to="/captain-signup"
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
          <div className="relative hidden overflow-hidden p-10 text-white md:flex md:flex-col md:justify-between lg:p-14">

            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1600&auto=format&fit=crop"
              alt="Drive with Rider"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60" />


            {/* Content */}
            <div className="relative z-10">

              {/* Logo */}
              <div className="mb-10 text-3xl font-bold">
                Rider
              </div>


              {/* Heading */}
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Welcome
                <br />
                back, Captain.
              </h1>


              {/* Description */}
              <p className="mt-6 max-w-sm leading-relaxed text-gray-200">
                Log in to your Rider Captain account and
                get back on the road. Your next trip is
                just a few clicks away.
              </p>

            </div>


            {/* Bottom Content */}
            <div className="relative z-10 mt-16">

              <div className="mb-4 h-px w-full bg-white/30" />

              <p className="text-sm text-gray-200">
                Drive. Earn. Move people forward.
              </p>

            </div>

          </div>


          {/* ================= RIGHT SIDE ================= */}
          <div className="p-6 sm:p-10 lg:p-14">

            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-3xl font-bold text-black">
                Captain Login
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Log in to start driving with Rider
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

              {/* ================= EMAIL ================= */}
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


              {/* ================= PASSWORD ================= */}
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


                  {/* Show / Hide Password */}
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


              {/* ================= REMEMBER ME ================= */}
              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  className="h-4 w-4 accent-black"
                />

                <span className="text-sm text-gray-600">
                  Remember me
                </span>

              </div>


              {/* ================= LOGIN BUTTON ================= */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading
                  ? "Logging in..."
                  : "Log in as Captain"}
              </button>

            </form>


            {/* ================= DIVIDER ================= */}
            <div className="my-8 flex items-center gap-4">

              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs text-gray-400">
                OR
              </span>

              <div className="h-px flex-1 bg-gray-200" />

            </div>


            {/* ================= GOOGLE LOGIN ================= */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 border border-gray-300 py-3.5 text-sm font-medium transition hover:bg-gray-50"
            >

              <span className="font-bold">
                G
              </span>

              Continue with Google

            </button>


            {/* ================= SIGNUP LINK ================= */}
            <p className="mt-8 text-center text-sm text-gray-500">

              Don't have a Captain account?{" "}

              <Link
                to="/captain-signup"
                className="font-semibold text-black underline"
              >
                Sign up
              </Link>

            </p>


            {/* ================= USER LOGIN ================= */}
            <p className="mt-4 text-center text-sm text-gray-500">

              Looking for a ride?{" "}

              <Link
                to="/login"
                className="font-semibold text-black underline"
              >
                User Login
              </Link>

            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default CaptainLogin;