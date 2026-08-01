import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import CaptainNavigationMap from "./CaptainNavigationMap";
import API_URL from "../config/api.js";
const CaptainRideDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // INITIAL RIDE
  // =====================================================

  const initialRide = location.state?.ride || null;

  // =====================================================
  // STATES
  // =====================================================

  const [ride, setRide] = useState(initialRide);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // Captain's own live location
  const [captainLocation, setCaptainLocation] =
    useState(null);

  // Passenger's live location
  const [userLocation, setUserLocation] =
    useState(null);

  const [selectedEta, setSelectedEta] = useState(
    initialRide?.captainEta || null
  );

  const [locationStatus, setLocationStatus] =
    useState("connecting");

  // =====================================================
  // USER / PASSENGER DETAILS
  // =====================================================

  const user = ride?.user || null;

  const userFirstName =
    user?.fullname?.firstname ||
    user?.fullname?.firstName ||
    "";

  const userLastName =
    user?.fullname?.lastname ||
    user?.fullname?.lastName ||
    "";

  const userName =
    `${userFirstName} ${userLastName}`.trim() ||
    "User";

  const userEmail =
    user?.email ||
    "Email not available";

  // =====================================================
  // VEHICLE
  // =====================================================

  const vehicleType =
    ride?.vehicleType || "car";

  const vehicleIcon =
    vehicleType === "motorcycle"
      ? "🏍️"
      : vehicleType === "auto"
      ? "🛺"
      : "🚗";

  // =====================================================
  // RIDE STATUS
  // =====================================================

  const rideStatus =
    ride?.status || "accepted";

  // =====================================================
  // STATUS TEXT
  // =====================================================

  const getStatusText = () => {
    switch (rideStatus) {
      case "accepted":
        return "Ride Accepted";

      case "captain_arrived":
        return "Captain Arrived";

      case "started":
        return "Ride In Progress";

      case "completed":
        return "Ride Completed";

      case "cancelled":
        return "Ride Cancelled";

      default:
        return "Ride Accepted";
    }
  };

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = () => {
    switch (rideStatus) {
      case "started":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "completed":
        return "bg-green-50 text-green-700 border-green-100";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-100";

      case "captain_arrived":
        return "bg-purple-50 text-purple-700 border-purple-100";

      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }
  };

  // =====================================================
  // AUTH CONFIG
  // =====================================================

  const getAuthConfig = () => {
    const token =
      localStorage.getItem("token");

    return {
      withCredentials: true,

      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    };
  };

  // =====================================================
  // FETCH RIDE DETAILS
  // =====================================================

  const fetchRide = async () => {
    if (!ride?._id) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await axios.get(
        `${API_URL}/rides/${ride._id}`,
        getAuthConfig()
      );

      if (response.data?.ride) {
        const updatedRide =
          response.data.ride;

        setRide(updatedRide);

        setSelectedEta(
          updatedRide.captainEta || null
        );
      }
    } catch (error) {
      console.error(
        "Fetch ride error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to fetch ride details"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH LATEST RIDE WHEN PAGE LOADS
  // =====================================================

  useEffect(() => {
    if (initialRide?._id) {
      fetchRide();
    }
  }, [initialRide?._id]);

  // =====================================================
  // CAPTAIN + USER LIVE LOCATION SOCKET
  // =====================================================

  useEffect(() => {
    if (!ride?._id) {
      return;
    }

    const token =
      localStorage.getItem("token");

    // ===================================================
    // GET CAPTAIN ID
    // ===================================================

    const captainId =
      ride?.captain?._id ||
      ride?.captainId?._id ||
      ride?.captainId ||
      localStorage.getItem("captainId");

    // ===================================================
    // CAPTAIN ID VALIDATION
    // ===================================================

    if (!captainId) {
      setLocationStatus("error");

      setError(
        "Captain ID not found. Please login again."
      );

      return;
    }

    // ===================================================
    // GEOLOCATION VALIDATION
    // ===================================================

    if (!navigator.geolocation) {
      setLocationStatus("error");

      setError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    // ===================================================
    // CONNECT SOCKET
    // ===================================================

    const socket = io(
      `${API_URL}`,
      {
        withCredentials: true,

        transports: [
          "websocket",
        ],

        auth: token
          ? {
              token,
            }
          : undefined,
      }
    );

    let watchId = null;

    // ===================================================
    // SOCKET CONNECTED
    // ===================================================

    socket.on(
      "connect",
      () => {
        console.log(
          "Captain socket connected:",
          socket.id
        );

        setLocationStatus(
          "connected"
        );

        setError("");

        // ===============================================
        // JOIN CAPTAIN ROOM
        // ===============================================

        socket.emit(
          "join-captain",
          captainId
        );

        // ===============================================
        // JOIN RIDE ROOM
        // ===============================================

        socket.emit(
          "join-captain-ride",
          {
            rideId: ride._id,
          }
        );

        console.log(
          "Captain joined ride room:",
          ride._id
        );

        // ===============================================
        // START CAPTAIN GPS
        // ===============================================

        if (watchId === null) {
          watchId =
            navigator.geolocation.watchPosition(
              (position) => {
                const lat =
                  position.coords.latitude;

                const lng =
                  position.coords.longitude;

                const newLocation = {
                  lat,
                  lng,
                };

                // =========================================
                // UPDATE CAPTAIN OWN LOCATION
                // =========================================

                setCaptainLocation(
                  newLocation
                );

                // =========================================
                // SEND CAPTAIN LOCATION TO BACKEND
                // =========================================

                socket.emit(
                  "captain-location-update",
                  {
                    rideId:
                      ride._id,

                    captainId,

                    lat,

                    lng,
                  }
                );

                console.log(
                  "Captain location sent:",
                  {
                    lat,
                    lng,
                  }
                );
              },

              (geoError) => {
                console.error(
                  "Captain GPS error:",
                  geoError
                );

                setLocationStatus(
                  "error"
                );

                if (
                  geoError.code ===
                  geoError.PERMISSION_DENIED
                ) {
                  setError(
                    "Location permission denied. Please allow location access."
                  );
                } else if (
                  geoError.code ===
                  geoError.POSITION_UNAVAILABLE
                ) {
                  setError(
                    "Your current location is unavailable."
                  );
                } else if (
                  geoError.code ===
                  geoError.TIMEOUT
                ) {
                  setError(
                    "Location request timed out."
                  );
                }
              },

              {
                enableHighAccuracy: true,

                timeout: 10000,

                maximumAge: 5000,
              }
            );
        }
      }
    );

    // ===================================================
    // RECEIVE USER LIVE LOCATION
    // ===================================================

    const handleUserLocationUpdate = (
      data
    ) => {
      console.log(
        "User live location received:",
        data
      );

      // ===============================================
      // CHECK RIDE ID
      // ===============================================

      if (
        data?.rideId !==
        ride._id
      ) {
        console.log(
          "Ignoring location from another ride"
        );

        return;
      }

      // ===============================================
      // VALIDATE COORDINATES
      // ===============================================

      if (
        typeof data.lat !==
          "number" ||
        typeof data.lng !==
          "number"
      ) {
        console.error(
          "Invalid user location:",
          data
        );

        return;
      }

      // ===============================================
      // UPDATE USER LOCATION
      // ===============================================

      setUserLocation({
        lat: data.lat,
        lng: data.lng,
      });

      console.log(
        "User location updated on captain map:",
        {
          lat: data.lat,
          lng: data.lng,
        }
      );
    };

    socket.on(
      "user-location-update",
      handleUserLocationUpdate
    );

    // ===================================================
    // RECEIVE INITIAL USER LOCATION
    // ===================================================

    const handleUserCurrentLocation = (
      data
    ) => {
      console.log(
        "Initial user location received:",
        data
      );

      // ===============================================
      // CHECK RIDE ID
      // ===============================================

      if (
        data?.rideId !==
        ride._id
      ) {
        return;
      }

      // ===============================================
      // VALIDATE COORDINATES
      // ===============================================

      if (
        typeof data.lat !==
          "number" ||
        typeof data.lng !==
          "number"
      ) {
        return;
      }

      // ===============================================
      // SET INITIAL USER LOCATION
      // ===============================================

      setUserLocation({
        lat: data.lat,
        lng: data.lng,
      });

      console.log(
        "Initial user location set:",
        {
          lat: data.lat,
          lng: data.lng,
        }
      );
    };

    socket.on(
      "user-current-location",
      handleUserCurrentLocation
    );

    // ===================================================
    // SOCKET CONNECTION ERROR
    // ===================================================

    const handleConnectError = (
      socketError
    ) => {
      console.error(
        "Captain socket error:",
        socketError
      );

      setLocationStatus(
        "error"
      );

      setError(
        "Unable to connect to live location service."
      );
    };

    socket.on(
      "connect_error",
      handleConnectError
    );

    // ===================================================
    // SOCKET DISCONNECTED
    // ===================================================

    const handleDisconnect = () => {
      console.log(
        "Captain socket disconnected"
      );

      setLocationStatus(
        "disconnected"
      );
    };

    socket.on(
      "disconnect",
      handleDisconnect
    );

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      console.log(
        "Cleaning captain + user location tracking"
      );

      // Stop captain GPS
      if (
        watchId !== null
      ) {
        navigator.geolocation.clearWatch(
          watchId
        );

        watchId = null;
      }

      // Remove listeners
      socket.off(
        "user-location-update",
        handleUserLocationUpdate
      );

      socket.off(
        "user-current-location",
        handleUserCurrentLocation
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.disconnect();
    };
  }, [ride?._id]);

  // =====================================================
  // UPDATE RIDE STATUS
  // =====================================================

  const updateRideStatus = async (
    status
  ) => {
    if (!ride?._id) {
      setError(
        "Ride ID is missing"
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      console.log(
        "Updating ride status:",
        status
      );

      const response =
        await axios.patch(
          `${API_URL}/rides/${ride._id}/status`,
          {
            status,
          },
          getAuthConfig()
        );

      console.log(
        "Ride status updated:",
        response.data
      );

      if (
        response.data?.ride
      ) {
        const updatedRide =
          response.data.ride;

        setRide(
          updatedRide
        );

        setSelectedEta(
          updatedRide.captainEta ||
            null
        );
      }
    } catch (error) {
      console.error(
        "Ride status update error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update ride status"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SET ETA
  // =====================================================

  const handleSetEta = async () => {
    if (!selectedEta) {
      setError(
        "Please select your arrival time"
      );

      return;
    }

    if (!ride?._id) {
      setError(
        "Ride ID is missing"
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response =
        await axios.patch(
          `${API_URL}/rides/${ride._id}/eta`,
          {
            eta: Number(
              selectedEta
            ),
          },
          getAuthConfig()
        );

      console.log(
        "ETA updated successfully:",
        response.data
      );

      if (
        response.data?.ride
      ) {
        setRide(
          response.data.ride
        );
      }
    } catch (error) {
      console.error(
        "ETA update error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update ETA"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RIDE ACTIONS
  // =====================================================

  const handleArrived = async () => {
    await updateRideStatus(
      "captain_arrived"
    );
  };

  const handleStartRide = async () => {
    await updateRideStatus(
      "started"
    );
  };

  const handleCompleteRide =
    async () => {
      await updateRideStatus(
        "completed"
      );
    };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate(-1);
  };

  // =====================================================
  // RIDE NOT FOUND
  // =====================================================

  if (!ride) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-5">

        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-black text-gray-900">
            Ride Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            We could not find the ride details.
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
            className="mt-6 w-full rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white"
          >
            Back to Home
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">

          <button
            onClick={
              handleBack
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xl hover:bg-gray-100"
          >
            ←
          </button>

          <div className="text-center">

            <h1 className="text-lg font-black text-gray-900">
              Ride Details
            </h1>

            <p className="text-xs text-gray-400">
              Captain Dashboard
            </p>

          </div>

          <div className="h-10 w-10" />

        </div>

      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-5">

        {/* =================================================
            STATUS
        ================================================= */}

        <section
          className={`rounded-3xl border p-5 ${getStatusColor()}`}
        >

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">

              {rideStatus ===
              "completed"
                ? "✓"
                : rideStatus ===
                  "started"
                ? "🚘"
                : rideStatus ===
                  "captain_arrived"
                ? "📍"
                : "🚗"}

            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-wider opacity-70">
                Current Status
              </p>

              <h2 className="mt-1 text-xl font-black">
                {getStatusText()}
              </h2>

            </div>

          </div>

        </section>

        {/* =================================================
            PASSENGER
        ================================================= */}

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black text-2xl font-black text-white">

              {userFirstName
                ? userFirstName
                    .charAt(0)
                    .toUpperCase()
                : "U"}

            </div>

            <div className="flex-1">

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Passenger
              </p>

              <h2 className="mt-1 text-2xl font-black text-gray-900">
                {userName}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {userEmail}
              </p>

            </div>

            <button
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl hover:bg-green-100"
              title="Call Passenger"
            >
              📞
            </button>

          </div>

        </section>

        {/* =================================================
            CAPTAIN LOCATION STATUS
        ================================================= */}

        <section className="mt-5 rounded-3xl border border-green-100 bg-green-50 p-5">

          <div className="flex items-center gap-4">

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-xl text-white ${
                locationStatus ===
                "connected"
                  ? "bg-green-500"
                  : locationStatus ===
                    "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            >
              📍
            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                Captain Live Location
              </p>

              <p className="mt-1 text-lg font-black text-green-900">

                {locationStatus ===
                "connected"
                  ? "Location is being shared"
                  : locationStatus ===
                    "error"
                  ? "Location unavailable"
                  : locationStatus ===
                    "disconnected"
                  ? "Location disconnected"
                  : "Connecting..."}

              </p>

              {captainLocation && (
                <p className="mt-1 text-xs text-green-700">

                  GPS:{" "}
                  {captainLocation.lat.toFixed(
                    5
                  )}
                  ,{" "}
                  {captainLocation.lng.toFixed(
                    5
                  )}

                </p>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            USER LIVE LOCATION STATUS
        ================================================= */}

        <section className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-center gap-4">

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-xl text-white ${
                userLocation
                  ? "bg-blue-500"
                  : "bg-gray-400"
              }`}
            >
              👤
            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Passenger Live Location
              </p>

              <p className="mt-1 text-lg font-black text-blue-900">

                {userLocation
                  ? "Passenger location is visible"
                  : "Waiting for passenger location..."}

              </p>

              {userLocation && (
                <p className="mt-1 text-xs text-blue-700">

                  GPS:{" "}
                  {userLocation.lat.toFixed(
                    5
                  )}
                  ,{" "}
                  {userLocation.lng.toFixed(
                    5
                  )}

                </p>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            ETA
        ================================================= */}

        {rideStatus ===
          "accepted" && (

          <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Arrival Time
            </p>

            <h2 className="mt-2 text-2xl font-black text-gray-900">
              How soon can you reach the passenger?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Select your estimated arrival time.
              The passenger will see this information.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

              {[5, 10, 15, 20].map(
                (minutes) => (

                  <button
                    key={minutes}
                    onClick={() =>
                      setSelectedEta(
                        minutes
                      )
                    }
                    disabled={
                      loading
                    }
                    className={`rounded-2xl border-2 px-4 py-4 text-sm font-bold transition ${
                      selectedEta ===
                      minutes
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {minutes} min
                  </button>

                )
              )}

            </div>

            <button
              onClick={
                handleSetEta
              }
              disabled={
                loading ||
                !selectedEta
              }
              className="mt-5 w-full rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading
                ? "Updating..."
                : ride?.captainEta
                ? `Update Arrival Time (${ride.captainEta} min)`
                : "Confirm Arrival Time"}

            </button>

          </section>

        )}

        {/* =================================================
            LIVE NAVIGATION MAP
        ================================================= */}

        <section className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Live Navigation
                </p>

                <h2 className="mt-1 text-xl font-black text-gray-900">

                  {rideStatus ===
                  "accepted"
                    ? "Navigate to Passenger"
                    : rideStatus ===
                      "captain_arrived"
                    ? "Passenger Pickup Location"
                    : rideStatus ===
                      "started"
                    ? "Navigate to Destination"
                    : "Ride Route"}

                </h2>

              </div>

              <div className="rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700">

                {locationStatus ===
                "connected"
                  ? "● Live"
                  : "Connecting..."}

              </div>

            </div>

          </div>

          <div className="relative h-[450px] w-full">

            <CaptainNavigationMap
              captainLocation={
                captainLocation
              }

              userLocation={
                userLocation
              }

              pickup={
                ride?.pickup
              }

              destination={
                ride?.destination
              }

              rideStatus={
                rideStatus
              }

            />

          </div>

        </section>

        {/* =================================================
            CAPTAIN ETA DISPLAY
        ================================================= */}

        {ride?.captainEta &&
          rideStatus !==
            "completed" &&
          rideStatus !==
            "cancelled" && (

          <section className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">

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

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            TRIP DETAILS
        ================================================= */}

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm">

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

          {/* =================================================
              DISTANCE / DURATION / FARE
          ================================================= */}

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
                Fare
              </p>

              <p className="mt-1 font-bold text-gray-900">

                ₹
                {ride?.estimatedFare
                  ? Number(
                      ride.estimatedFare
                    ).toFixed(0)
                  : "0"}

              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            VEHICLE
        ================================================= */}

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Vehicle
              </p>

              <h2 className="mt-1 text-xl font-black capitalize text-gray-900">
                {vehicleType}
              </h2>

            </div>

            <div className="text-4xl">
              {vehicleIcon}
            </div>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">

            <p className="text-sm font-bold text-red-700">
              {error}
            </p>

          </div>

        )}

        {/* =================================================
            RIDE ACTION BUTTONS
        ================================================= */}

        <section className="mt-5">

          {/* ACCEPTED */}

          {rideStatus ===
            "accepted" && (

            <button
              onClick={
                handleArrived
              }
              disabled={
                loading ||
                !ride?.captainEta
              }
              className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading
                ? "Updating..."
                : "📍 I Have Arrived"}

            </button>

          )}

          {/* CAPTAIN ARRIVED */}

          {rideStatus ===
            "captain_arrived" && (

            <button
              onClick={
                handleStartRide
              }
              disabled={
                loading
              }
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >

              {loading
                ? "Updating..."
                : "🚘 Start Ride"}

            </button>

          )}

          {/* STARTED */}

          {rideStatus ===
            "started" && (

            <button
              onClick={
                handleCompleteRide
              }
              disabled={
                loading
              }
              className="w-full rounded-2xl bg-green-600 px-6 py-4 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >

              {loading
                ? "Updating..."
                : "✓ Complete Ride"}

            </button>

          )}

          {/* COMPLETED */}

          {rideStatus ===
            "completed" && (

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">

              <p className="text-lg font-black text-green-800">
                Ride Completed
              </p>

              <p className="mt-1 text-sm text-green-600">
                This ride has been successfully completed.
              </p>

            </div>

          )}

          {/* CANCELLED */}

          {rideStatus ===
            "cancelled" && (

            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">

              <p className="text-lg font-black text-red-800">
                Ride Cancelled
              </p>

              <p className="mt-1 text-sm text-red-600">
                This ride has been cancelled.
              </p>

            </div>

          )}

        </section>

        {/* =================================================
            RIDE ID
        ================================================= */}

        <div className="mt-6 rounded-2xl bg-gray-100 p-4">

          <p className="text-xs font-bold text-gray-400">
            Ride ID
          </p>

          <p className="mt-1 break-all text-xs text-gray-600">
            {ride?._id}
          </p>

        </div>

      </main>

    </div>
  );
};

export default CaptainRideDetails;