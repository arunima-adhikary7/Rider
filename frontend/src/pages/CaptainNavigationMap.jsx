import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useState } from "react";

import "leaflet/dist/leaflet.css";

// =====================================================
// FIX DEFAULT LEAFLET MARKER
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =====================================================
// CAPTAIN ICON
// =====================================================

const captainIcon = L.divIcon({
  className: "captain-live-marker",

  html: `
    <div style="
      width:42px;
      height:42px;
      background:#000;
      border:4px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:21px;
      box-shadow:0 3px 10px rgba(0,0,0,0.35);
    ">
      🚗
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

// =====================================================
// USER ICON
// =====================================================

const userIcon = L.divIcon({
  className: "user-live-marker",

  html: `
    <div style="
      width:42px;
      height:42px;
      background:#2563eb;
      border:4px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:21px;
      box-shadow:0 3px 10px rgba(0,0,0,0.35);
    ">
      👤
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

// =====================================================
// PICKUP ICON
// =====================================================

const pickupIcon = L.divIcon({
  className: "pickup-marker",

  html: `
    <div style="
      width:36px;
      height:36px;
      background:#16a34a;
      border:4px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
      box-shadow:0 3px 10px rgba(0,0,0,0.3);
    ">
      📍
    </div>
  `,

  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// =====================================================
// DESTINATION ICON
// =====================================================

const destinationIcon = L.divIcon({
  className: "destination-marker",

  html: `
    <div style="
      width:36px;
      height:36px;
      background:#dc2626;
      border:4px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
      box-shadow:0 3px 10px rgba(0,0,0,0.3);
    ">
      🏁
    </div>
  `,

  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// =====================================================
// GET COORDINATES
// =====================================================

const getCoordinates = (location) => {

  if (!location) {
    return null;
  }

  // ===================================================
  // { lat, lng }
  // ===================================================

  if (
    location.lat !== undefined &&
    location.lng !== undefined
  ) {

    const lat =
      Number(location.lat);

    const lng =
      Number(location.lng);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return {
        lat,
        lng,
      };
    }
  }

  // ===================================================
  // { latitude, longitude }
  // ===================================================

  if (
    location.latitude !== undefined &&
    location.longitude !== undefined
  ) {

    const lat =
      Number(location.latitude);

    const lng =
      Number(location.longitude);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return {
        lat,
        lng,
      };
    }
  }

  // ===================================================
  // { coordinates: { lat, lng } }
  // ===================================================

  if (
    location.coordinates &&
    !Array.isArray(
      location.coordinates
    ) &&
    location.coordinates.lat !==
      undefined &&
    location.coordinates.lng !==
      undefined
  ) {

    const lat =
      Number(
        location.coordinates.lat
      );

    const lng =
      Number(
        location.coordinates.lng
      );

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return {
        lat,
        lng,
      };
    }
  }

  // ===================================================
  // { location: { lat, lng } }
  // ===================================================

  if (
    location.location &&
    location.location.lat !==
      undefined &&
    location.location.lng !==
      undefined
  ) {

    return getCoordinates(
      location.location
    );
  }

  // ===================================================
  // { userLocation: { lat, lng } }
  // ===================================================

  if (
    location.userLocation
  ) {

    return getCoordinates(
      location.userLocation
    );
  }

  // ===================================================
  // MongoDB GeoJSON
  //
  // coordinates: [lng, lat]
  // ===================================================

  if (
    Array.isArray(
      location.coordinates
    ) &&
    location.coordinates.length >= 2
  ) {

    const lng =
      Number(
        location.coordinates[0]
      );

    const lat =
      Number(
        location.coordinates[1]
      );

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return {
        lat,
        lng,
      };
    }
  }

  return null;
};

// =====================================================
// AUTO CENTER
// =====================================================

const MapAutoCenter = ({
  captainLocation,
  userLocation,
  pickupLocation,
  destinationLocation,
  rideStatus,
}) => {

  const map = useMap();

  useEffect(() => {

    const points = [];

    // =================================================
    // ACCEPTED
    // Captain + Passenger
    // =================================================

    if (
      rideStatus ===
      "accepted"
    ) {

      if (
        captainLocation
      ) {

        points.push([
          captainLocation.lat,
          captainLocation.lng,
        ]);

      }

      if (
        userLocation
      ) {

        points.push([
          userLocation.lat,
          userLocation.lng,
        ]);

      }

    }

    // =================================================
    // CAPTAIN ARRIVED
    // =================================================

    if (
      rideStatus ===
      "captain_arrived"
    ) {

      if (
        captainLocation
      ) {

        points.push([
          captainLocation.lat,
          captainLocation.lng,
        ]);

      }

      if (
        pickupLocation
      ) {

        points.push([
          pickupLocation.lat,
          pickupLocation.lng,
        ]);

      }

    }

    // =================================================
    // STARTED
    // =================================================

    if (
      rideStatus ===
      "started"
    ) {

      if (
        captainLocation
      ) {

        points.push([
          captainLocation.lat,
          captainLocation.lng,
        ]);

      }

      if (
        destinationLocation
      ) {

        points.push([
          destinationLocation.lat,
          destinationLocation.lng,
        ]);

      }

    }

    // =================================================
    // NO POINTS
    // =================================================

    if (
      points.length === 0
    ) {
      return;
    }

    // =================================================
    // ONE POINT
    // =================================================

    if (
      points.length === 1
    ) {

      map.setView(
        points[0],
        15,
        {
          animate: true,
        }
      );

      return;
    }

    // =================================================
    // MULTIPLE POINTS
    // =================================================

    const bounds =
      L.latLngBounds(
        points
      );

    map.fitBounds(
      bounds,
      {
        padding: [
          80,
          80,
        ],

        maxZoom: 15,

        animate: true,
      }
    );

  }, [

    map,

    rideStatus,

    captainLocation?.lat,
    captainLocation?.lng,

    userLocation?.lat,
    userLocation?.lng,

    pickupLocation?.lat,
    pickupLocation?.lng,

    destinationLocation?.lat,
    destinationLocation?.lng,

  ]);

  return null;
};

// =====================================================
// OSRM ROUTE
// =====================================================

const getRoute = async (
  start,
  end
) => {

  try {

    if (
      !start ||
      !end
    ) {
      return [];
    }

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start.lng},${start.lat};` +
      `${end.lng},${end.lat}` +
      `?overview=full&geometries=geojson`;

    console.log(
      "Requesting OSRM route:",
      url
    );

    const response =
      await fetch(url);

    if (
      !response.ok
    ) {

      throw new Error(
        `OSRM HTTP error: ${response.status}`
      );

    }

    const data =
      await response.json();

    if (
      data.code !== "Ok" ||
      !data.routes ||
      data.routes.length === 0
    ) {

      console.error(
        "No OSRM route found:",
        data
      );

      return [];
    }

    const coordinates =
      data.routes[0]
        .geometry
        .coordinates;

    return coordinates.map(
      ([lng, lat]) => [
        Number(lat),
        Number(lng),
      ]
    );

  } catch (error) {

    console.error(
      "OSRM route error:",
      error
    );

    return [];

  }
};

// =====================================================
// CAPTAIN NAVIGATION MAP
// =====================================================

const CaptainNavigationMap = ({
  captainLocation,
  userLocation,
  pickup,
  destination,
  fare,
  rideStatus = "accepted",
}) => {

  // ===================================================
  // CONVERT LOCATIONS
  // ===================================================

  const captainCoords =
    getCoordinates(
      captainLocation
    );

  const userCoords =
    getCoordinates(
      userLocation
    );

  const pickupCoords =
    getCoordinates(
      pickup
    );

  const destinationCoords =
    getCoordinates(
      destination
    );

  // ===================================================
  // ROUTE
  // ===================================================

  const [
    routeCoordinates,
    setRouteCoordinates,
  ] = useState([]);

  const [
    routeLoading,
    setRouteLoading,
  ] = useState(false);

  // ===================================================
  // DEBUG
  // ===================================================

  useEffect(() => {

    console.log(
      "================================"
    );

    console.log(
      "CAPTAIN NAVIGATION MAP"
    );

    console.log(
      "Ride Status:",
      rideStatus
    );

    console.log(
      "Captain:",
      captainCoords
    );

    console.log(
      "Passenger:",
      userCoords
    );

    console.log(
      "Pickup:",
      pickupCoords
    );

    console.log(
      "Destination:",
      destinationCoords
    );

    console.log(
      "================================"
    );

  }, [

    rideStatus,

    captainCoords?.lat,
    captainCoords?.lng,

    userCoords?.lat,
    userCoords?.lng,

    pickupCoords?.lat,
    pickupCoords?.lng,

    destinationCoords?.lat,
    destinationCoords?.lng,

  ]);

  // ===================================================
  // LOAD ROUTE
  // ===================================================

  useEffect(() => {

    let cancelled = false;

    const loadRoute =
      async () => {

        setRouteCoordinates([]);

        // =============================================
        // ACCEPTED
        // Captain → Passenger
        // =============================================

        if (
          rideStatus ===
          "accepted"
        ) {

          if (
            !captainCoords ||
            !userCoords
          ) {

            console.log(
              "Waiting for captain/passenger location..."
            );

            setRouteLoading(
              false
            );

            return;
          }

          setRouteLoading(
            true
          );

          const route =
            await getRoute(
              captainCoords,
              userCoords
            );

          if (
            !cancelled
          ) {

            setRouteCoordinates(
              route
            );

            setRouteLoading(
              false
            );

          }

          return;
        }

        // =============================================
        // CAPTAIN ARRIVED
        // =============================================

        if (
          rideStatus ===
          "captain_arrived"
        ) {

          setRouteCoordinates(
            []
          );

          setRouteLoading(
            false
          );

          return;
        }

        // =============================================
        // STARTED
        // Captain → Destination
        // =============================================

        if (
          rideStatus ===
          "started"
        ) {

          if (
            !captainCoords ||
            !destinationCoords
          ) {

            setRouteLoading(
              false
            );

            return;
          }

          setRouteLoading(
            true
          );

          const route =
            await getRoute(
              captainCoords,
              destinationCoords
            );

          if (
            !cancelled
          ) {

            setRouteCoordinates(
              route
            );

            setRouteLoading(
              false
            );

          }

          return;
        }

        setRouteCoordinates(
          []
        );

        setRouteLoading(
          false
        );

      };

    loadRoute();

    return () => {
      cancelled = true;
    };

  }, [

    rideStatus,

    captainCoords?.lat,
    captainCoords?.lng,

    userCoords?.lat,
    userCoords?.lng,

    pickupCoords?.lat,
    pickupCoords?.lng,

    destinationCoords?.lat,
    destinationCoords?.lng,

  ]);

  // ===================================================
  // DEFAULT CENTER
  // ===================================================

  const defaultCenter =
    captainCoords
      ? [
          captainCoords.lat,
          captainCoords.lng,
        ]

      : userCoords
      ? [
          userCoords.lat,
          userCoords.lng,
        ]

      : pickupCoords
      ? [
          pickupCoords.lat,
          pickupCoords.lng,
        ]

      : destinationCoords
      ? [
          destinationCoords.lat,
          destinationCoords.lng,
        ]

      : [
          22.5726,
          88.3639,
        ];

  // ===================================================
  // MAP
  // ===================================================

  return (

    <div className="relative h-full w-full">

      <MapContainer
        center={
          defaultCenter
        }

        zoom={14}

        scrollWheelZoom={true}

        className="h-full w-full"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoCenter
          captainLocation={
            captainCoords
          }

          userLocation={
            userCoords
          }

          pickupLocation={
            pickupCoords
          }

          destinationLocation={
            destinationCoords
          }

          rideStatus={
            rideStatus
          }
        />

        {/* ============================================
            CAPTAIN
        ============================================ */}

        {captainCoords && (

          <Marker
            position={[
              captainCoords.lat,
              captainCoords.lng,
            ]}
            icon={
              captainIcon
            }
          >

            <Popup>

              <strong>
                🚗 Captain
              </strong>

              <br />

              Live Location

            </Popup>

          </Marker>

        )}

        {/* ============================================
            PASSENGER
        ============================================ */}

        {userCoords && (

          <Marker
            position={[
              userCoords.lat,
              userCoords.lng,
            ]}
            icon={
              userIcon
            }
          >

            <Popup>

              <strong>
                👤 Passenger
              </strong>

              <br />

              Live Location

            </Popup>

          </Marker>

        )}

        {/* ============================================
            PICKUP
        ============================================ */}

        {pickupCoords && (

          <Marker
            position={[
              pickupCoords.lat,
              pickupCoords.lng,
            ]}
            icon={
              pickupIcon
            }
          >

            <Popup>

              <strong>
                📍 Pickup
              </strong>

              <br />

              {pickup?.address ||
                "Pickup Location"}

            </Popup>

          </Marker>

        )}

        {/* ============================================
            DESTINATION
        ============================================ */}

        {destinationCoords && (

          <Marker
            position={[
              destinationCoords.lat,
              destinationCoords.lng,
            ]}
            icon={
              destinationIcon
            }
          >

            <Popup>

              <strong>
                🏁 Destination
              </strong>

              <br />

              {destination?.address ||
                "Destination"}

            </Popup>

          </Marker>

        )}

        {/* ============================================
            ROUTE
        ============================================ */}

        {routeCoordinates.length > 0 && (

          <Polyline
            positions={
              routeCoordinates
            }

            pathOptions={{
              color:
                rideStatus ===
                "accepted"
                  ? "#2563eb"
                  : "#16a34a",

              weight: 7,

              opacity: 0.9,
            }}
          />

        )}

      </MapContainer>

      {/* ==============================================
          FARE
      ============================================== */}

      <div className="absolute right-4 top-4 z-[1000] rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-xl">

        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Estimated Fare
        </p>

        <p className="mt-1 text-xl font-black text-gray-900">

          ₹
          {fare !== undefined &&
          fare !== null &&
          fare !== ""
            ? Number(fare).toFixed(0)
            : "0"}

        </p>

      </div>

      {/* ==============================================
          STATUS
      ============================================== */}

      <div className="absolute left-4 top-4 z-[1000] rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl">

        <div className="flex items-center gap-2 text-xs font-bold">

          <span
            className={`h-3 w-3 rounded-full ${
              routeCoordinates.length > 0
                ? "bg-green-500"
                : "bg-gray-400"
            }`}
          />

          {rideStatus ===
            "accepted" &&
            "🚗 Driving to passenger"}

          {rideStatus ===
            "captain_arrived" &&
            "📍 Captain arrived"}

          {rideStatus ===
            "started" &&
            "🏁 Driving to destination"}

          {rideStatus ===
            "completed" &&
            "✅ Ride completed"}

          {rideStatus ===
            "cancelled" &&
            "❌ Ride cancelled"}

        </div>

        {rideStatus ===
          "accepted" && (

          <p className="mt-1 text-[10px] text-gray-500">

            {userCoords
              ? "Passenger location received"
              : "Waiting for passenger location"}

          </p>

        )}

      </div>

      {/* ==============================================
          ROUTE LOADING
      ============================================== */}

      {routeLoading && (

        <div className="absolute left-1/2 top-16 z-[1000] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-lg">

          🛣️ Calculating road route...

        </div>

      )}

    </div>

  );
};

export default CaptainNavigationMap;