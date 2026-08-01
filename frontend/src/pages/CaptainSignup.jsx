import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api.js";
const CaptainSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    color: "",
    plate: "",
    capacity: "",
    vehicleType: "car",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ================= HANDLE FORM SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/captain/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          // Required if backend sends HTTP-only cookie
          credentials: "include",

          body: JSON.stringify({
            fullname: {
              firstname: formData.firstname.trim(),
              lastname: formData.lastname.trim(),
            },

            email: formData.email.trim(),

            password: formData.password,

            vehicle: {
              color: formData.color.trim(),
              plate: formData.plate.trim().toUpperCase(),
              capacity: Number(formData.capacity),
              vehicleType: formData.vehicleType,
            },
          }),
        }
      );

      // Try to parse JSON response
      const data = await response.json();

      console.log("Captain Signup Response:", data);

      // ================= BACKEND ERROR =================
      if (!response.ok) {
        setError(
          data.message ||
            data.errors?.[0]?.msg ||
            "Captain registration failed. Please try again."
        );

        return;
      }

      // ================= SUCCESS =================
      setSuccess(
        "Captain account created successfully! Redirecting to login..."
      );

      // Clear form
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        color: "",
        plate: "",
        capacity: "",
        vehicleType: "car",
      });

      // Redirect to Captain Login
      setTimeout(() => {
        navigate("/captain-login");
      }, 1500);

    } catch (error) {
      console.error("Captain Signup Error:", error);

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

        {/* LOGO */}
        <Link
          to="/"
          className="text-3xl font-bold tracking-tight text-black"
        >
          Rider
        </Link>

        {/* LOGIN LINK */}
        <div className="flex items-center gap-3">

          <span className="hidden text-sm text-gray-600 sm:block">
            Already a captain?
          </span>

          <Link
            to="/captain-login"
            className="rounded-full border border-black px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            Log in
          </Link>

        </div>

      </header>


      {/* ================= MAIN SECTION ================= */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4 py-12">

        <div className="grid w-full max-w-6xl overflow-hidden bg-white shadow-xl md:grid-cols-2">


          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="relative hidden min-h-[700px] overflow-hidden p-10 text-white md:flex md:flex-col md:justify-between lg:p-14">

            {/* BACKGROUND IMAGE */}
            <img
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1600&auto=format&fit=crop"
              alt="Drive with Rider"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/60" />

            {/* CONTENT */}
            <div className="relative z-10">

              {/* LOGO */}
              <div className="mb-10 text-3xl font-bold">
                Rider
              </div>

              {/* HEADING */}
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Drive with
                <br />
                Rider.
              </h1>

              {/* DESCRIPTION */}
              <p className="mt-6 max-w-sm leading-relaxed text-gray-200">
                Turn your time into opportunity. Join Rider
                as a captain and start earning by driving
                people to their destinations.
              </p>

            </div>


            {/* BOTTOM CONTENT */}
            <div className="relative z-10 mt-16">

              <div className="mb-4 h-px w-full bg-white/30" />

              <p className="text-sm text-gray-200">
                Drive. Earn. Move people forward.
              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* RIGHT SIDE - FORM */}
          {/* ================================================= */}

          <div className="p-6 sm:p-10 lg:p-12">

            {/* HEADING */}
            <div className="mb-8">

              <h2 className="text-3xl font-bold text-black">
                Become a Rider Captain
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your captain account and start driving.
              </p>

            </div>


            {/* ================= ERROR MESSAGE ================= */}
            {error && (
              <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}


            {/* ================= SUCCESS MESSAGE ================= */}
            {success && (
              <div className="mb-6 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}


            {/* ================= FORM ================= */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* ================= NAME ================= */}
              <div className="grid gap-4 sm:grid-cols-2">

                {/* FIRST NAME */}
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


                {/* LAST NAME */}
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

                <label className="mb-2 block text-sm font-medium text-black">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="w-full border border-gray-300 px-4 py-3.5 pr-20 text-sm outline-none transition focus:border-black"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-black"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 6 characters.
                </p>

              </div>


              {/* ================= VEHICLE SECTION ================= */}
              <div className="border-t border-gray-200 pt-6">

                <h3 className="mb-4 text-lg font-semibold text-black">
                  Vehicle Information
                </h3>


                {/* VEHICLE TYPE */}
                <div className="mb-5">

                  <label className="mb-2 block text-sm font-medium text-black">
                    Vehicle type
                  </label>

                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black"
                  >

                    <option value="car">
                      Car
                    </option>

                    <option value="motorcycle">
                      Motorcycle
                    </option>

                    <option value="auto">
                      Auto
                    </option>

                  </select>

                </div>


                {/* COLOR + PLATE */}
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* COLOR */}
                  <div>

                    <label className="mb-2 block text-sm font-medium text-black">
                      Vehicle color
                    </label>

                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="e.g. Black"
                      required
                      className="w-full border border-gray-300 px-4 py-3.5 text-sm outline-none transition focus:border-black"
                    />

                  </div>


                  {/* PLATE */}
                  <div>

                    <label className="mb-2 block text-sm font-medium text-black">
                      License plate
                    </label>

                    <input
                      type="text"
                      name="plate"
                      value={formData.plate}
                      onChange={handleChange}
                      placeholder="e.g. ABC123"
                      required
                      className="w-full border border-gray-300 px-4 py-3.5 text-sm uppercase outline-none transition focus:border-black"
                    />

                  </div>

                </div>


                {/* CAPACITY */}
                <div className="mt-4">

                  <label className="mb-2 block text-sm font-medium text-black">
                    Passenger capacity
                  </label>

                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 4"
                    min="1"
                    max="10"
                    required
                    className="w-full border border-gray-300 px-4 py-3.5 text-sm outline-none transition focus:border-black"
                  />

                </div>

              </div>


              {/* ================= TERMS ================= */}
              <div className="flex items-start gap-3">

                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 accent-black"
                />

                <p className="text-xs leading-relaxed text-gray-500">
                  I agree to Rider's{" "}
                  <span className="font-medium text-black underline">
                    Captain Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-black underline">
                    Privacy Policy
                  </span>
                  .
                </p>

              </div>


              {/* ================= SUBMIT BUTTON ================= */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading
                  ? "Creating account..."
                  : "Create Captain account"}
              </button>

            </form>


            {/* ================= LOGIN LINK ================= */}
            <p className="mt-8 text-center text-sm text-gray-500">

              Already a Rider Captain?{" "}

              <Link
                to="/captain-login"
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

export default CaptainSignup;