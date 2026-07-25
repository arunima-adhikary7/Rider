import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const UserSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Backend expects:
      // {
      //   fullname: {
      //     firstname,
      //     lastname
      //   },
      //   email,
      //   password
      // }

      const response = await fetch(
        "http://localhost:3000/users/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            fullname: {
              firstname: formData.firstname,
              lastname: formData.lastname,
            },
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      console.log("Backend Response:", data);

      if (!response.ok) {
        // Express-validator errors
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].msg);
        } else {
          setError(data.message || "Registration failed");
        }

        return;
      }

      // Registration successful
      setSuccess("Account created successfully!");

      console.log("User:", data.user);
      console.log("Token:", data.token);

      // Navigate to login after 1.5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Signup Error:", error);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
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

        {/* Login */}
        <div className="flex items-center gap-3">

          <span className="hidden text-sm text-gray-600 sm:block">
            Already have an account?
          </span>

          <Link
            to="/login"
            className="rounded-full border border-black px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            Log in
          </Link>

        </div>

      </header>


      {/* ================= SIGNUP SECTION ================= */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4 py-12">

        <div className="grid w-full max-w-5xl overflow-hidden bg-white shadow-xl md:grid-cols-2">


          {/* ================= LEFT SIDE ================= */}
          <div className="hidden bg-black p-10 text-white md:flex md:flex-col md:justify-between lg:p-14">

            <div>

              <div className="mb-10 text-3xl font-bold">
                Rider
              </div>

              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Your journey
                <br />
                starts here.
              </h1>

              <p className="mt-6 max-w-sm leading-relaxed text-gray-400">
                Create your Rider account and enjoy a simple,
                reliable way to get wherever you need to go.
              </p>

            </div>


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
                Create your account
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Sign up to start riding with Rider
              </p>

            </div>


            {/* Error Message */}
            {error && (
              <div className="mb-5 border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}


            {/* Success Message */}
            {success && (
              <div className="mb-5 border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}


            {/* Signup Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-black">
                    First name
                  </label>

                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                    className="w-full border border-gray-300 px-4 py-3.5 text-sm outline-none transition focus:border-black"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-black">
                    Last name
                  </label>

                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full border border-gray-300 px-4 py-3.5 text-sm outline-none transition focus:border-black"
                  />

                </div>

              </div>


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

                <label className="mb-2 block text-sm font-medium text-black">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm outline-none transition focus:border-black"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 6 characters.
                </p>

              </div>


              {/* Terms */}
              <div className="flex items-start gap-3">

                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 accent-black"
                />

                <p className="text-xs leading-relaxed text-gray-500">
                  I agree to Rider's{" "}
                  <span className="font-medium text-black underline">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-black underline">
                    Privacy Policy
                  </span>
                  .
                </p>

              </div>


              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating account..."
                  : "Create Rider account"}
              </button>

            </form>


            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-gray-500">

              Already have a Rider account?{" "}

              <Link
                to="/login"
                className="font-semibold text-black underline"
              >
                Log in
              </Link>

            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default UserSignup;