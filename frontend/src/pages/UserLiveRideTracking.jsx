import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import API_URL from "../config/api.js";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ======================================================
// FIX DEFAULT LEAFLET MARKER
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ======================================================
// CAPTAIN ICON
// ======================================================

const captainIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/744/744465.png",

  iconSize: [45, 45],

  iconAnchor: [22, 22],

  popupAnchor: [0, -22],
});

// ======================================================
// PICKUP ICON
// ======================================================

const pickupIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

// ======================================================
// DESTINATION ICON
// ======================================================

const destinationIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/684/684908.png",

  iconSize: [38, 38],

  iconAnchor: [19, 38],
});

// ======================================================
// MAP UPDATER
// Moves map when captain location changes
// ======================================================

const MapUpdater = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo(
      [location.lat, location.lng],
      15,
      {
        duration: 1,
      }
    );
  }, [location, map]);

  return null;
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const UserLiveRideTracking = () => {
  const location = useLocation();

  const navigate = useNavigate();

  // ====================================================
  // GET RIDE FROM ROUTER STATE
  // ====================================================

  const initialRide =
    location.state?.ride || null;

  // ====================================================
  // STATES
  // ====================================================

  const [ride, setRide] =
    useState(initialRide);

  const [captainLocation, setCaptainLocation] =
    useState(null);

  const [route, setRoute] =
    useState([]);

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [routeError, setRouteError] =
    useState("");

  const [connectionStatus, setConnectionStatus] =
    useState("connecting");

  // ====================================================
  // PICKUP
  // ====================================================

  const pickup = ride?.pickup
    ? {
        lat: Number(ride.pickup.lat),
        lng: Number(ride.pickup.lng),
      }
    : null;

  // ====================================================
  // DESTINATION
  // ====================================================

  const destination = ride?.destination
    ? {
        lat: Number(ride.destination.lat),
        lng: Number(ride.destination.lng),
      }
    : null;

  // ====================================================
  // CAPTAIN
  // ====================================================

  const captain =
    ride?.captain || null;

  // ====================================================
  // CAPTAIN NAME
  // ====================================================

  const captainFirstName =
    captain?.fullname?.firstname ||
    captain?.fullname?.firstName ||
    "Captain";

  const captainLastName =
    captain?.fullname?.lastname ||
    captain?.fullname?.lastName ||
    "";

  const fullCaptainName =
    `${captainFirstName} ${captainLastName}`.trim();

  // ====================================================
  // VEHICLE TYPE
  // ====================================================

  const vehicleType =
    captain?.vehicle?.vehicleType ||
    ride?.vehicleType ||
    "car";

  // ====================================================
  // VEHICLE NUMBER
  // ====================================================

  const vehicleNumber =
    captain?.vehicle?.plate ||
    captain?.vehicle?.number ||
    captain?.vehicle?.plateNumber ||
    "Vehicle number unavailable";

  // ====================================================
  // CAPTAIN ETA
  // ====================================================

  const captainEta =
    ride?.captainEta ?? null;

  // ====================================================
  // GET ROUTE
  // Pickup -> Destination
  // ====================================================

  useEffect(() => {
    if (
      !pickup ||
      !destination
    ) {
      setRoute([]);

      return;
    }

    const getRoute = async () => {
      try {
        setRouteLoading(true);

        setRouteError("");

        const params =
          new URLSearchParams({
            pickupLat:
              String(pickup.lat),

            pickupLng:
              String(pickup.lng),

            destinationLat:
              String(destination.lat),

            destinationLng:
              String(destination.lng),
          });

        const response =
          await fetch(
            `${API_URL}/maps/get-route?${params.toString()}`,
            {
              method: "GET",

              credentials: "include",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Route request failed: ${response.status}`
          );
        }

        if (
          !data?.geometry?.coordinates ||
          data.geometry.coordinates.length === 0
        ) {
          throw new Error(
            "No route found"
          );
        }

        // ==========================================
        // OSRM RETURNS:
        // [lng, lat]
        //
        // LEAFLET NEEDS:
        // [lat, lng]
        // ==========================================

        const leafletRoute =
          data.geometry.coordinates.map(
            ([lng, lat]) => [
              Number(lat),
              Number(lng),
            ]
          );

        setRoute(
          leafletRoute
        );
      } catch (error) {
        console.error(
          "User route error:",
          error
        );

        setRoute([]);

        setRouteError(
          error.message ||
            "Unable to find route"
        );
      } finally {
        setRouteLoading(false);
      }
    };

    getRoute();
  }, [
    pickup?.lat,
    pickup?.lng,
    destination?.lat,
    destination?.lng,
  ]);

  // ====================================================
  // SOCKET.IO
  // ====================================================

  useEffect(() => {
    // -----------------------------------------------
    // IF THERE IS NO RIDE
    // DON'T CONNECT TO RIDE TRACKING
    // -----------------------------------------------

    if (!ride?._id) {
      console.log(
        "No ride ID available"
      );

      return;
    }

    // -----------------------------------------------
    // TOKEN
    // -----------------------------------------------

    const token =
      localStorage.getItem(
        "token"
      );

    // -----------------------------------------------
    // CREATE SOCKET
    // -----------------------------------------------

    const socket =
      io(`${API_URL}`, {
        withCredentials: true,

        transports: [
          "websocket",
        ],

        auth: token
          ? {
              token,
            }
          : undefined,
      });

    // =================================================
    // SOCKET CONNECTED
    // =================================================

    socket.on(
      "connect",
      () => {
        console.log(
          "User tracking socket connected:",
          socket.id
        );

        setConnectionStatus(
          "connected"
        );

        // --------------------------------------------
        // GET USER ID
        // --------------------------------------------

        const userId =
          ride?.user?._id ||
          ride?.user ||
          localStorage.getItem(
            "userId"
          );

        // --------------------------------------------
        // JOIN USER ROOM
        // --------------------------------------------

        if (userId) {
          socket.emit(
            "join-user",
            userId
          );
        }

        // --------------------------------------------
        // JOIN RIDE ROOM
        // --------------------------------------------

        socket.emit(
          "join-ride",
          {
            rideId:
              ride._id,

            userId,
          }
        );
      }
    );

    // =================================================
    // SOCKET DISCONNECTED
    // =================================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "User socket disconnected"
        );

        setConnectionStatus(
          "disconnected"
        );
      }
    );

    // =================================================
    // SOCKET ERROR
    // =================================================

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Socket connection error:",
          error
        );

        setConnectionStatus(
          "error"
        );
      }
    );

    // =================================================
    // CAPTAIN LOCATION UPDATED
    // =================================================

    socket.on(
      "captain-location-updated",
      (data) => {
        console.log(
          "Captain location received:",
          data
        );

        // --------------------------------------------
        // CHECK LOCATION
        // --------------------------------------------

        if (
          !data?.location
        ) {
          return;
        }

        // --------------------------------------------
        // CHECK RIDE ID
        // --------------------------------------------

        if (
          data.rideId &&
          String(
            data.rideId
          ) !==
            String(
              ride._id
            )
        ) {
          return;
        }

        // --------------------------------------------
        // CONVERT COORDINATES
        // --------------------------------------------

        const lat =
          Number(
            data.location.lat
          );

        const lng =
          Number(
            data.location.lng
          );

        // --------------------------------------------
        // VALIDATE COORDINATES
        // --------------------------------------------

        if (
          Number.isNaN(lat) ||
          Number.isNaN(lng)
        ) {
          console.error(
            "Invalid captain location"
          );

          return;
        }

        // --------------------------------------------
        // UPDATE CAPTAIN LOCATION
        // --------------------------------------------

        setCaptainLocation({
          lat,
          lng,
        });
      }
    );

    // =================================================
    // RIDE STATUS UPDATED
    // =================================================

    socket.on(
      "ride-status-updated",
      (data) => {
        console.log(
          "Ride status updated:",
          data
        );

        // --------------------------------------------
        // CHECK RIDE ID
        // --------------------------------------------

        if (
          data?.rideId &&
          String(
            data.rideId
          ) !==
            String(
              ride._id
            )
        ) {
          return;
        }

        // --------------------------------------------
        // COMPLETE RIDE OBJECT
        // --------------------------------------------

        if (
          data?.ride
        ) {
          setRide(
            data.ride
          );

          return;
        }

        // --------------------------------------------
        // ONLY STATUS
        // --------------------------------------------

        if (
          data?.status
        ) {
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

    // =================================================
    // CAPTAIN ETA UPDATED
    // =================================================

    socket.on(
      "captain-eta-updated",
      (data) => {
        console.log(
          "Captain ETA received:",
          data
        );

        // --------------------------------------------
        // CHECK RIDE ID
        // --------------------------------------------

        if (
          data?.rideId &&
          String(
            data.rideId
          ) !==
            String(
              ride._id
            )
        ) {
          return;
        }

        // --------------------------------------------
        // UPDATE ETA
        // --------------------------------------------

        if (
          data?.eta !==
          undefined
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

    // =================================================
    // CLEANUP
    // =================================================

    return () => {
      console.log(
        "Cleaning user tracking socket"
      );

      socket.off(
        "captain-location-updated"
      );

      socket.off(
        "ride-status-updated"
      );

      socket.off(
        "captain-eta-updated"
      );

      socket.disconnect();
    };
  }, [ride?._id]);

  // ====================================================
  // STATUS TEXT
  // ====================================================

  const statusText = () => {
    switch (
      ride?.status
    ) {
      case "searching":
        return "Searching for captain";

      case "accepted":
        return "Captain is on the way";

      case "captain_arrived":
        return "Captain has arrived";

      case "started":
        return "Ride in progress";

      case "completed":
        return "Ride completed";

      case "cancelled":
        return "Ride cancelled";

      default:
        return "Waiting for captain";
    }
  };

  // ====================================================
  // DEFAULT MAP CENTER
  // ====================================================

  const defaultCenter =
    captainLocation ||
    pickup ||
    destination || {
      lat: 22.5726,
      lng: 88.3639,
    };

  // ====================================================
  // RIDE NOT FOUND
  // ====================================================

  if (!ride) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-black text-gray-900">
            Ride Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            We could not find your active ride.
          </p>

          <p className="mt-4 text-xs text-gray-400">
            Make sure you navigate to this
            page with the ride object.
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

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">

      {/* =================================================
          MAP
      ================================================= */}

      <MapContainer
        center={[
          defaultCenter.lat,
          defaultCenter.lng,
        ]}
        zoom={14}
        className="h-full w-full"
      >

        {/* ===============================================
            OPENSTREETMAP
        =============================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ===============================================
            MOVE MAP WITH CAPTAIN
        =============================================== */}

        <MapUpdater
          location={
            captainLocation
          }
        />

        {/* ===============================================
            CAPTAIN LOCATION
        =============================================== */}

        {captainLocation && (
          <Marker
            position={[
              captainLocation.lat,
              captainLocation.lng,
            ]}
            icon={
              captainIcon
            }
          >

            <Popup>
              <strong>
                Captain Location
              </strong>

              <br />

              Your captain is here.

            </Popup>

          </Marker>
        )}

        {/* ===============================================
            PICKUP
        =============================================== */}

        {pickup && (
          <Marker
            position={[
              pickup.lat,
              pickup.lng,
            ]}
            icon={
              pickupIcon
            }
          >

            <Popup>

              <strong>
                Pickup Location
              </strong>

              <br />

              {ride.pickup?.address}

            </Popup>

          </Marker>
        )}

        {/* ===============================================
            DESTINATION
        =============================================== */}

        {destination && (
          <Marker
            position={[
              destination.lat,
              destination.lng,
            ]}
            icon={
              destinationIcon
            }
          >

            <Popup>

              <strong>
                Destination
              </strong>

              <br />

              {ride.destination?.address}

            </Popup>

          </Marker>
        )}

        {/* ===============================================
            ROUTE
        =============================================== */}

        {route.length >= 2 && (
          <Polyline
            positions={
              route
            }
            pathOptions={{
              color: "black",

              weight: 5,

              opacity: 0.7,
            }}
          />
        )}

      </MapContainer>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="absolute left-0 right-0 top-0 z-[1000]">

        <div className="flex items-center justify-between px-5 py-5">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-lg"
          >
            ←
          </button>

          <div className="rounded-xl bg-white px-5 py-3 shadow-lg">

            <h1 className="text-xl font-black text-black">
              Rider
            </h1>

          </div>

          <div className="h-11 w-11" />

        </div>

      </header>

      {/* =================================================
          BOTTOM INFORMATION PANEL
      ================================================= */}

      <div className="absolute bottom-0 left-0 right-0 z-[1000] md:bottom-6 md:left-6 md:right-auto md:w-[450px]">

        <div className="rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl">

          {/* =============================================
              STATUS
          ============================================= */}

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Ride Status
              </p>

              <h2 className="mt-1 text-2xl font-black text-gray-900">
                {statusText()}
              </h2>

            </div>

            <div
              className={`h-3 w-3 rounded-full ${
                connectionStatus ===
                "connected"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

          </div>

          {/* =============================================
              CONNECTION STATUS
          ============================================= */}

          <p className="mt-2 text-xs text-gray-400">

            {connectionStatus ===
            "connected"
              ? "Live tracking connected"
              : "Connecting to live tracking..."}

          </p>

          {/* =============================================
              ROUTE LOADING
          ============================================= */}

          {routeLoading && (
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-center">

              <p className="text-sm font-bold text-gray-700">
                Finding route...
              </p>

            </div>
          )}

          {/* =============================================
              ROUTE ERROR
          ============================================= */}

          {routeError && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">

              <p className="text-sm font-bold text-red-700">
                {routeError}
              </p>

            </div>
          )}

          {/* =============================================
              CAPTAIN ETA
          ============================================= */}

          {captainEta !== null && (
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">

              <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                Captain ETA
              </p>

              <p className="mt-1 text-2xl font-black text-blue-900">

                {captainEta} minutes

              </p>

              <p className="mt-1 text-xs text-blue-600">
                Estimated time to reach your pickup location
              </p>

            </div>
          )}

          {/* =============================================
              CAPTAIN DETAILS
          ============================================= */}

          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-gray-50 p-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-xl font-black text-white">

              {captainFirstName
                .charAt(0)
                .toUpperCase()}

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Your Captain
              </p>

              <h3 className="mt-1 truncate text-lg font-black text-gray-900">
                {fullCaptainName}
              </h3>

              <p className="mt-1 text-sm capitalize text-gray-500">
                {vehicleType}
              </p>

              <p className="mt-1 text-xs font-bold text-gray-700">
                {vehicleNumber}
              </p>

            </div>

            <div className="text-3xl">

              {vehicleType ===
              "motorcycle"
                ? "🏍️"
                : vehicleType ===
                  "auto"
                ? "🛺"
                : "🚗"}

            </div>

          </div>

          {/* =============================================
              LIVE CAPTAIN LOCATION
          ============================================= */}

          {captainLocation ? (

            <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                  📍
                </div>

                <div>

                  <p className="text-sm font-bold text-green-800">
                    Captain location is live
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    The map updates as your captain moves.
                  </p>

                </div>

              </div>

            </div>

          ) : (

            <div className="mt-4 rounded-2xl border border-yellow-100 bg-yellow-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white">
                  ⏳
                </div>

                <div>

                  <p className="text-sm font-bold text-yellow-800">
                    Waiting for captain location
                  </p>

                  <p className="mt-1 text-xs text-yellow-600">
                    Captain location will appear here when available.
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* =============================================
              COMPLETED
          ============================================= */}

          {ride?.status ===
            "completed" && (

            <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4 text-center">

              <p className="font-black text-green-800">
                Ride Completed
              </p>

            </div>

          )}

          {/* =============================================
              CANCELLED
          ============================================= */}

          {ride?.status ===
            "cancelled" && (

            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-center">

              <p className="font-black text-red-800">
                Ride Cancelled
              </p>

            </div>

          )}

          {/* =============================================
              BACK BUTTON
          ============================================= */}

          <button
            onClick={() =>
              navigate(-1)
            }
            className="mt-5 w-full rounded-2xl border border-gray-200 py-4 text-sm font-bold text-gray-800 hover:bg-gray-50"
          >
            Back
          </button>

        </div>

      </div>

    </div>
  );
};

export default UserLiveRideTracking;