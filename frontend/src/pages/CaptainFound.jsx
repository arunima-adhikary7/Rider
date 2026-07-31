import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import CaptainLiveMap from "../pages/CaptainLiveMap";

const CaptainFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // RIDE DATA PASSED FROM PREVIOUS PAGE
  // =====================================================

  const initialRide = location.state?.ride || null;

  const [ride, setRide] = useState(initialRide);

  const [loading, setLoading] = useState(!initialRide);

  const [error, setError] = useState("");

  // =====================================================
  // CAPTAIN LIVE LOCATION
  // =====================================================

  const [captainLocation, setCaptainLocation] =
    useState(null);

  // =====================================================
  // LOCATION CONNECTION STATUS
  // =====================================================

  const [locationStatus, setLocationStatus] =
    useState("connecting");

  // =====================================================
  // SOCKET.IO
  // =====================================================

  useEffect(() => {
    // ---------------------------------------------------
    // We need ride ID to join ride room
    // ---------------------------------------------------

    if (!ride?._id) {
      console.log(
        "Ride ID not available yet"
      );

      return;
    }

    console.log(
      "Starting user socket for ride:",
      ride._id
    );

    // ---------------------------------------------------
    // CREATE SOCKET CONNECTION
    // ---------------------------------------------------

    const socket = io(
      "http://localhost:3000",
      {
        withCredentials: true,
      }
    );

    console.log(
      "User socket connecting..."
    );

    // ===================================================
    // SOCKET CONNECTED
    // ===================================================

    socket.on(
      "connect",
      () => {
        console.log(
          "User socket connected:",
          socket.id
        );

        setLocationStatus(
          "connected"
        );

        // ------------------------------------------------
        // GET USER ID
        // ------------------------------------------------

        const userId =
          localStorage.getItem(
            "userId"
          );

        console.log(
          "User ID:",
          userId
        );

        // ------------------------------------------------
        // JOIN USER
        // ------------------------------------------------

        if (userId) {
          socket.emit(
            "join-user",
            userId
          );

          console.log(
            "User joined socket:",
            userId
          );
        }

        // ------------------------------------------------
        // JOIN RIDE ROOM
        // ------------------------------------------------

        socket.emit(
          "join-ride",
          {
            rideId: ride._id,
            userId,
          }
        );

        console.log(
          "User joined ride room:",
          `ride-${ride._id}`
        );
      }
    );

    // ===================================================
    // CAPTAIN LOCATION UPDATED
    // ===================================================

    socket.on(
      "captain-location-updated",
      (data) => {
        console.log(
          "Captain live location received:",
          data
        );

        // -----------------------------------------------
        // Check correct ride
        // -----------------------------------------------

        if (
          data.rideId &&
          data.rideId !== ride._id
        ) {
          console.log(
            "Location belongs to another ride"
          );

          return;
        }

        // -----------------------------------------------
        // Save captain location
        // -----------------------------------------------

        if (
          data.location
        ) {
          setCaptainLocation(
            data.location
          );

          setLocationStatus(
            "live"
          );
        }
      }
    );

    // ===================================================
    // CAPTAIN ETA UPDATED
    // ===================================================

    socket.on(
      "captain-eta-updated",
      (data) => {
        console.log(
          "Captain ETA received:",
          data
        );

        if (
          data.rideId &&
          data.rideId !== ride._id
        ) {
          return;
        }

        // -----------------------------------------------
        // Update ride ETA
        // -----------------------------------------------

        if (
          data.eta !== undefined
        ) {
          setRide(
            (previousRide) => ({
              ...previousRide,

              captainEta:
                data.eta,
            })
          );
        }
      }
    );

    // ===================================================
    // RIDE STATUS UPDATED
    // ===================================================

    socket.on(
      "ride-status-updated",
      (data) => {
        console.log(
          "Ride status updated:",
          data
        );

        if (
          data.rideId &&
          data.rideId !== ride._id
        ) {
          return;
        }

        // -----------------------------------------------
        // Update full ride
        // -----------------------------------------------

        if (data.ride) {
          setRide(
            data.ride
          );
        }

        // -----------------------------------------------
        // If only status received
        // -----------------------------------------------

        else if (data.status) {
          setRide(
            (previousRide) => ({
              ...previousRide,

              status:
                data.status,
            })
          );
        }
      }
    );

    // ===================================================
    // RIDE ACCEPTED
    // ===================================================

    socket.on(
      "ride-accepted",
      (data) => {
        console.log(
          "Captain accepted ride:",
          data
        );

        if (data.ride) {
          setRide(
            data.ride
          );
        }

        setLoading(false);
      }
    );

    // ===================================================
    // SOCKET CONNECT ERROR
    // ===================================================

    socket.on(
      "connect_error",
      (socketError) => {
        console.error(
          "User socket connection error:",
          socketError
        );

        setLocationStatus(
          "error"
        );

        setError(
          "Unable to connect to Rider live location service."
        );

        setLoading(false);
      }
    );

    // ===================================================
    // SOCKET DISCONNECTED
    // ===================================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "User socket disconnected"
        );

        setLocationStatus(
          "disconnected"
        );
      }
    );

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      console.log(
        "Disconnecting user socket..."
      );

      socket.disconnect();
    };

  }, [ride?._id]);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-5">

        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-500" />

          </div>

          <h1 className="mt-6 text-2xl font-black text-gray-900">
            Finding Your Captain
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            We're looking for a nearby captain
            who can take you to your destination.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">

            <span className="h-2 w-2 animate-pulse rounded-full bg-black" />

            <span
              className="h-2 w-2 animate-pulse rounded-full bg-black"
              style={{
                animationDelay:
                  "150ms",
              }}
            />

            <span
              className="h-2 w-2 animate-pulse rounded-full bg-black"
              style={{
                animationDelay:
                  "300ms",
              }}
            />

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-5">

        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-black text-gray-900">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
            className="mt-6 w-full rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Back to Home
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // CAPTAIN DATA
  // =====================================================

  const captain =
    ride?.captain;

  const captainFirstName =
    captain?.fullname?.firstname ||
    "Captain";

  const captainLastName =
    captain?.fullname?.lastname ||
    "";

  const captainName =
    `${captainFirstName} ${captainLastName}`.trim();


  const vehicleType =
    captain?.vehicle?.vehicleType ||
    ride?.vehicleType ||
    "car";


  const vehicleColor =
    captain?.vehicle?.color ||
    "Not specified";


  const vehiclePlate =
    captain?.vehicle?.plate ||
    "Not available";


  // =====================================================
  // VEHICLE ICON
  // =====================================================

  const vehicleIcon =
    vehicleType === "motorcycle"
      ? "🏍️"
      : vehicleType === "auto"
      ? "🛺"
      : "🚗";


  // =====================================================
  // BACK HOME
  // =====================================================

  const handleBackHome = () => {
    navigate("/");
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">

          <div>

            <h1 className="text-2xl font-black tracking-tight text-black">
              Rider
            </h1>

            <p className="text-xs font-medium text-gray-400">
              Your ride is confirmed
            </p>

          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">

            <span className="text-lg">
              ✓
            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-5">


        {/* =================================================
            SUCCESS BANNER
        ================================================= */}

        <section className="overflow-hidden rounded-3xl bg-black p-6 text-white shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-2">

                <span className="h-2 w-2 rounded-full bg-green-400" />

                <span className="text-xs font-bold text-green-400">
                  Captain Confirmed
                </span>

              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Your Captain is on the way
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                Your ride has been accepted.
                Your captain will pick you up
                from your selected location.
              </p>

            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl">

              {vehicleIcon}

            </div>

          </div>

        </section>


        {/* =================================================
            LIVE CAPTAIN LOCATION MAP
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="relative h-[450px] w-full">

            <CaptainLiveMap
              captainLocation={
                captainLocation
              }
              pickup={
                ride?.pickup
              }
              destination={
                ride?.destination
              }
            />

          </div>


          {/* LOCATION INFORMATION */}

          <div className="p-5">

            <div className="flex items-center gap-4">

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl text-white ${
                  locationStatus ===
                  "live"
                    ? "bg-green-500"
                    : locationStatus ===
                      "error"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                📍
              </div>


              <div className="flex-1">

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Captain Location
                </p>


                {locationStatus ===
                  "live" &&
                captainLocation ? (
                  <>

                    <p className="mt-1 text-lg font-black text-green-700">
                      Captain is moving
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      GPS:{" "}
                      {captainLocation.lat.toFixed(
                        6
                      )}
                      {" , "}
                      {captainLocation.lng.toFixed(
                        6
                      )}
                    </p>

                  </>

                ) : locationStatus ===
                  "connected" ? (

                  <p className="mt-1 text-sm font-bold text-yellow-600">
                    Waiting for captain location...
                  </p>

                ) : locationStatus ===
                  "error" ? (

                  <p className="mt-1 text-sm font-bold text-red-600">
                    Location unavailable
                  </p>

                ) : (

                  <p className="mt-1 text-sm font-bold text-gray-600">
                    Connecting...
                  </p>

                )}

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ETA
        ================================================= */}

        {ride?.captainEta && (

          <section className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-xl text-white">
                ⏱️
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                  Captain ETA
                </p>

                <p className="mt-1 text-xl font-black text-blue-900">
                  {ride.captainEta} minutes
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  Your captain is on the way.
                </p>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            CAPTAIN CARD
        ================================================= */}

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black text-2xl font-black text-white">

              {captainFirstName
                .charAt(0)
                .toUpperCase()}

            </div>


            <div className="flex-1">

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Your Captain
              </p>

              <h2 className="mt-1 text-2xl font-black text-gray-900">
                {captainName}
              </h2>

              <div className="mt-2 flex items-center gap-2">

                <span className="text-yellow-500">
                  ★
                </span>

                <span className="text-sm font-bold text-gray-900">
                  5.0
                </span>

                <span className="text-sm text-gray-400">
                  Captain rating
                </span>

              </div>

            </div>


            <button
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl transition hover:bg-green-100"
              title="Call Captain"
            >
              📞
            </button>

          </div>

        </section>


        {/* =================================================
            VEHICLE DETAILS
        ================================================= */}

        <section className="mt-4 rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Vehicle
              </p>

              <h3 className="mt-1 text-xl font-black capitalize text-gray-900">
                {vehicleType}
              </h3>

            </div>

            <div className="text-4xl">
              {vehicleIcon}
            </div>

          </div>


          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-gray-50 p-4">

              <p className="text-xs text-gray-400">
                Color
              </p>

              <p className="mt-1 font-bold capitalize text-gray-900">
                {vehicleColor}
              </p>

            </div>


            <div className="rounded-2xl bg-gray-50 p-4">

              <p className="text-xs text-gray-400">
                Number Plate
              </p>

              <p className="mt-1 font-bold uppercase text-gray-900">
                {vehiclePlate}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            RIDE DETAILS
        ================================================= */}

        <section className="mt-4 rounded-3xl bg-white p-6 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Trip Details
          </p>


          <div className="mt-6 flex gap-4">

            <div className="flex flex-col items-center">

              <div className="mt-1 h-3 w-3 rounded-full bg-black" />

              <div className="h-20 w-px bg-gray-300" />

              <div className="h-3 w-3 rounded-full border-2 border-black bg-white" />

            </div>


            <div className="min-w-0 flex-1">

              <div className="mb-8">

                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pickup
                </p>

                <p className="mt-1 text-sm font-bold leading-5 text-gray-900">
                  {ride?.pickup?.address ||
                    "Pickup location"}
                </p>

              </div>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Destination
                </p>

                <p className="mt-1 text-sm font-bold leading-5 text-gray-900">
                  {ride?.destination?.address ||
                    "Destination"}
                </p>

              </div>

            </div>

          </div>


          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

            <div className="rounded-2xl bg-gray-50 p-4">

              <p className="text-xs text-gray-400">
                Distance
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {ride?.distance
                  ? `${Number(
                      ride.distance
                    ).toFixed(1)} km`
                  : "--"}
              </p>

            </div>


            <div className="rounded-2xl bg-gray-50 p-4">

              <p className="text-xs text-gray-400">
                Duration
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {ride?.duration
                  ? `${Math.round(
                      ride.duration
                    )} min`
                  : "--"}
              </p>

            </div>


            <div className="rounded-2xl bg-gray-50 p-4">

              <p className="text-xs text-gray-400">
                Estimated Fare
              </p>

              <p className="mt-1 font-bold text-gray-900">
                ₹
                {ride?.estimatedFare
                  ? Number(
                      ride.estimatedFare
                    ).toFixed(2)
                  : "0.00"}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            STATUS
        ================================================= */}

        <section className="mt-4 rounded-3xl border border-green-100 bg-green-50 p-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-xl text-white">
              ✓
            </div>

            <div>

              <p className="font-black text-green-900">

                {ride?.status ===
                "started"
                  ? "Ride In Progress"
                  : ride?.status ===
                    "captain_arrived"
                  ? "Captain Has Arrived"
                  : "Ride Accepted"}

              </p>

              <p className="mt-1 text-sm text-green-700">

                {ride?.status ===
                "started"
                  ? "Your ride is currently in progress."
                  : ride?.status ===
                    "captain_arrived"
                  ? "Your captain has arrived at the pickup location."
                  : "Your captain has accepted your ride request."}

              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          onClick={
            handleBackHome
          }
          className="mt-6 w-full rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Back to Home
        </button>

      </main>

    </div>
  );
};

export default CaptainFound;