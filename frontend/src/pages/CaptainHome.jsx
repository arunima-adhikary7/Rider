
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const CaptainHome = () => {
  const navigate = useNavigate();

  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // FETCH CAPTAIN PROFILE
  // =========================

  useEffect(() => {
    const fetchCaptain = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:3000/captain/profile",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch captain profile");
        }

        const data = await response.json();

        setCaptain(data.captain || data);
      } catch (error) {
        console.error("Captain profile error:", error);

        setError("Unable to load captain information.");
      } finally {
        setLoading(false);
      }
    };

    fetchCaptain();
  }, []);

  // =========================
  // SOCKET CONNECTION
  // =========================

  useEffect(() => {
    if (!captain?._id) {
      return;
    }

    const socket = io("http://localhost:3000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Captain socket connected:", socket.id);

      // Tell backend this captain is online
      socket.emit("join-captain", captain._id);

      setIsOnline(true);
    });

    // =========================
    // RECEIVE RIDE REQUEST
    // =========================

    socket.on("new-ride-request", (ride) => {
      console.log("New ride request received:", ride);

      setRideRequest(ride);
    });

    socket.on("disconnect", () => {
      console.log("Captain socket disconnected");

      setIsOnline(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [captain?._id]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await fetch(
        "http://localhost:3000/captain/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      navigate("/captain-login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // =========================
  // ACCEPT RIDE
  // =========================

  const handleAcceptRide = () => {
    if (!rideRequest) {
      return;
    }

    /*
      Backend accept ride API will be connected here.

      Example later:

      POST /rides/:rideId/accept

      For now we only show the received
      ride request.
    */

    console.log(
      "Accept ride:",
      rideRequest.rideId
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // CAPTAIN DATA
  // =========================

  const firstName =
    captain?.fullname?.firstname || "Captain";

  const lastName =
    captain?.fullname?.lastname || "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  const vehicleType =
    captain?.vehicle?.vehicleType || "Vehicle";

  const vehicleColor =
    captain?.vehicle?.color || "Not specified";

  const vehiclePlate =
    captain?.vehicle?.plate || "Not specified";

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-10">

      {/* =========================
          HEADER
      ========================= */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          {/* LOGO */}

          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Rider
            </h1>

            <p className="text-xs font-medium text-gray-400">
              Captain Dashboard
            </p>
          </div>

          {/* PROFILE */}

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-bold text-gray-900">
                {fullName}
              </p>

              <p className="text-xs capitalize text-gray-500">
                {vehicleType} Captain
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* =========================
          MAIN
      ========================= */}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-5">

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}


        {/* =========================
            WELCOME SECTION
        ========================= */}

        <section className="mb-6 overflow-hidden rounded-3xl bg-black p-6 text-white shadow-sm sm:p-8">

          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">

            <div>

              <p className="text-sm font-medium text-gray-400">
                Welcome back
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Hello, {firstName}
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400">
                Stay online to receive ride requests from
                passengers looking for your vehicle type.
              </p>

            </div>


            {/* ONLINE STATUS */}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

              <div className="flex items-center gap-3">

                <div
                  className={`h-3 w-3 rounded-full ${
                    isOnline
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`}
                />

                <div>

                  <p className="text-sm font-bold">
                    {isOnline
                      ? "You're Online"
                      : "You're Offline"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {isOnline
                      ? "Waiting for ride requests"
                      : "Connecting to RiderOut"}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            STATS
        ========================= */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-3xl bg-white p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Status
            </p>

            <div className="mt-3 flex items-center gap-2">

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnline
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />

              <p className="font-bold capitalize text-gray-900">
                {isOnline
                  ? "Online"
                  : "Offline"}
              </p>

            </div>

          </div>


          <div className="rounded-3xl bg-white p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Vehicle
            </p>

            <p className="mt-3 font-bold capitalize text-gray-900">
              {vehicleType}
            </p>

          </div>


          <div className="rounded-3xl bg-white p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Ride Requests
            </p>

            <p className="mt-3 font-bold text-gray-900">
              {rideRequest ? "1 New" : "Waiting"}
            </p>

          </div>

        </section>


        {/* =========================
            RIDE REQUEST
        ========================= */}

        {rideRequest ? (

          <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  New Ride Request
                </p>

                <h2 className="mt-1 text-2xl font-black text-gray-900">
                  Passenger is waiting
                </h2>

              </div>

              <div className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-600">
                New Request
              </div>

            </div>


            {/* ROUTE */}

            <div className="mt-6 rounded-2xl bg-gray-50 p-5">

              <div className="flex gap-4">

                {/* ROUTE LINE */}

                <div className="flex flex-col items-center">

                  <div className="mt-1 h-3 w-3 rounded-full bg-black" />

                  <div className="h-20 w-px bg-gray-300" />

                  <div className="h-3 w-3 rounded-full border-2 border-black bg-white" />

                </div>


                {/* LOCATIONS */}

                <div className="min-w-0 flex-1">

                  <div className="mb-8">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Pickup
                    </p>

                    <p className="mt-1 text-sm font-bold leading-5 text-gray-900">
                      {rideRequest.pickup?.address ||
                        "Pickup location"}
                    </p>

                  </div>


                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Destination
                    </p>

                    <p className="mt-1 text-sm font-bold leading-5 text-gray-900">
                      {rideRequest.destination?.address ||
                        "Destination"}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* RIDE INFORMATION */}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <div className="rounded-2xl bg-gray-50 p-4">

                <p className="text-xs text-gray-400">
                  Distance
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {rideRequest.distance
                    ? `${Number(
                        rideRequest.distance
                      ).toFixed(1)} km`
                    : "--"}
                </p>

              </div>


              <div className="rounded-2xl bg-gray-50 p-4">

                <p className="text-xs text-gray-400">
                  Duration
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {rideRequest.duration
                    ? `${Math.round(
                        rideRequest.duration
                      )} min`
                    : "--"}
                </p>

              </div>


              <div className="rounded-2xl bg-gray-50 p-4">

                <p className="text-xs text-gray-400">
                  Vehicle
                </p>

                <p className="mt-1 font-bold capitalize text-gray-900">
                  {rideRequest.vehicleType ||
                    vehicleType}
                </p>

              </div>


              <div className="rounded-2xl bg-gray-50 p-4">

                <p className="text-xs text-gray-400">
                  Estimated Fare
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  ₹
                  {rideRequest.estimatedFare
                    ? Number(
                        rideRequest.estimatedFare
                      ).toFixed(0)
                    : "0"}
                </p>

              </div>

            </div>


            {/* ACTION */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={handleAcceptRide}
                className="flex-1 rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                Accept Ride
              </button>

              <button
                onClick={() => setRideRequest(null)}
                className="rounded-2xl border border-gray-200 px-6 py-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Decline
              </button>

            </div>

          </section>

        ) : (

          /* =========================
              WAITING STATE
          ========================= */

          <section className="rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">

              <div
                className={`h-5 w-5 rounded-full ${
                  isOnline
                    ? "animate-pulse bg-green-500"
                    : "bg-gray-400"
                }`}
              />

            </div>


            <h2 className="mt-6 text-2xl font-black text-gray-900">
              {isOnline
                ? "You're ready to ride"
                : "Connecting..."}
            </h2>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">

              {isOnline
                ? "We'll notify you when a passenger requests a ride that matches your vehicle."
                : "We're connecting you to the RiderOut network. Please wait a moment."}

            </p>


            {isOnline && (
              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-600">

                <span className="h-2 w-2 rounded-full bg-green-500" />

                Listening for ride requests

              </div>
            )}

          </section>

        )}


        {/* =========================
            VEHICLE CARD
        ========================= */}

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Your vehicle
          </p>

          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-3xl text-white">
                {vehicleType === "motorcycle"
                  ? "🏍️"
                  : vehicleType === "auto"
                  ? "🛺"
                  : "🚗"}
              </div>

              <div>

                <h3 className="text-lg font-black capitalize text-gray-900">
                  {vehicleType}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {vehicleColor}
                </p>

              </div>

            </div>


            <div className="rounded-2xl bg-gray-50 px-5 py-3">

              <p className="text-xs text-gray-400">
                Vehicle plate
              </p>

              <p className="mt-1 font-bold uppercase text-gray-900">
                {vehiclePlate}
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default CaptainHome;

