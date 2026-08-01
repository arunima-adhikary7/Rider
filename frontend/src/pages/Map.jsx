import { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  useMap,
} from "react-leaflet";

import { useNavigate } from "react-router-dom";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import API_URL from "../config/api.js";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MapClickHandler = ({
  selecting,
  setPickup,
  setDestination,
  setSelecting,
}) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      if (selecting === "pickup") {
        setPickup({
          lat,
          lng,
          address: `Selected location (${lat.toFixed(
            4
          )}, ${lng.toFixed(4)})`,
        });

        setSelecting("destination");
      } else {
        setDestination({
          lat,
          lng,
          address: `Selected destination (${lat.toFixed(
            4
          )}, ${lng.toFixed(4)})`,
        });

        setSelecting("destination");
      }
    },
  });

  return null;
};

const MapFlyTo = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo([location.lat, location.lng], 15, {
      duration: 1.5,
    });
  }, [location, map]);

  return null;
};

const LocationSearch = ({ type, value, onSelect }) => {
  const [query, setQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (value?.address) {
      setQuery(value.address);
    }
  }, [value]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const searchLocation = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          format: "jsonv2",
          q: trimmedQuery,
          limit: "5",
          addressdetails: "1",
          countrycodes: "in",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Location search failed: ${response.status}`
          );
        }

        const data = await response.json();

        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchLocation, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (location) => {
    const selectedLocation = {
      lat: Number(location.lat),
      lng: Number(location.lon),
      address: location.display_name,
    };

    setQuery(location.display_name);
    setSuggestions([]);
    setShowSuggestions(false);

    onSelect(selectedLocation);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={
          type === "pickup"
            ? "Search pickup location"
            : "Search destination"
        }
        className="
          w-full
          rounded-xl
          border
          border-gray-200
          bg-white
          p-3
          text-sm
          text-gray-900
          outline-none
          transition
          focus:border-black
          focus:ring-1
          focus:ring-black
        "
      />

      {loading && (
        <div
          className="
            absolute
            right-3
            top-3
            text-xs
            text-gray-500
          "
        >
          Searching...
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-[3000]
            mt-1
            max-h-64
            overflow-y-auto
            rounded-xl
            border
            border-gray-200
            bg-white
            shadow-2xl
          "
        >
          {suggestions.map((location) => (
            <button
              key={location.place_id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(location);
              }}
              className="
                flex
                w-full
                items-start
                gap-3
                border-b
                border-gray-100
                p-3
                text-left
                transition
                last:border-b-0
                hover:bg-gray-50
              "
            >
              <div
                className="
                  mt-1
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                "
              >
                📍
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
                  {location.display_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Map = () => {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);

  const [selecting, setSelecting] = useState("pickup");

  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [fare, setFare] = useState(null);

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!pickup || !destination) {
      setRoute([]);
      setDistance(null);
      setDuration(null);
      setFare(null);
      setRouteError(null);
      return;
    }

    const getRoute = async () => {
      try {
        setLoadingRoute(true);
        setRouteError(null);

        const params = new URLSearchParams({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
        });

        const url =
          `${API_URL}/maps/get-route?${params.toString()}`;

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({}));

          throw new Error(
            errorData.message ||
              `Route request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (
          !data.geometry ||
          !data.geometry.coordinates ||
          data.geometry.coordinates.length === 0
        ) {
          throw new Error(
            "Invalid route received from backend"
          );
        }

        const leafletRoute =
          data.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );

        setRoute(leafletRoute);

        const routeDistance =
          Number(data.distanceInKm);

        setDistance(routeDistance);

        const routeDuration =
          Number(data.durationInMinutes);

        setDuration(routeDuration);

        const baseFare = 50;
        const perKmRate = 12;
        const perMinuteRate = 2;

        const calculatedFare =
          baseFare +
          routeDistance * perKmRate +
          routeDuration * perMinuteRate;

        setFare(calculatedFare);
      } catch (error) {
        console.error("Route error:", error);

        setRouteError(
          error.message ||
            "Unable to calculate route"
        );

        setRoute([]);
        setDistance(null);
        setDuration(null);
        setFare(null);
      } finally {
        setLoadingRoute(false);
      }
    };

    getRoute();
  }, [pickup, destination]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat =
            position.coords.latitude;

          const lng =
            position.coords.longitude;

          const params = new URLSearchParams({
            format: "jsonv2",
            lat,
            lon: lng,
          });

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              "Reverse geocoding failed"
            );
          }

          const data = await response.json();

          setPickup({
            lat,
            lng,
            address:
              data.display_name ||
              "Current location",
          });

          setSelecting("destination");
        } catch (error) {
          console.error(
            "Current location error:",
            error
          );

          alert(
            "Could not find your current address."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        setLocationLoading(false);

        alert(
          "Unable to get your location. Please allow location access."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirmRide = () => {
    if (!pickup || !destination) {
      alert(
        "Please select pickup and destination."
      );

      return;
    }

    if (loadingRoute) {
      alert(
        "Please wait for route calculation."
      );

      return;
    }

    if (
      fare === null ||
      route.length === 0
    ) {
      alert(
        "Fare is not ready yet."
      );

      return;
    }

    navigate("/vehicle-selection", {
      state: {
        pickup,
        destination,
        distance,
        duration,
        estimatedFare: fare,
      },
    });
  };

  const handleReset = () => {
    setPickup(null);
    setDestination(null);
    setRoute([]);
    setDistance(null);
    setDuration(null);
    setFare(null);
    setRouteError(null);
    setSelecting("pickup");
  };

  return (
    <div
      className="
        relative
        h-screen
        w-full
        overflow-hidden
        bg-gray-100
      "
    >
      <header
        className="
          absolute
          left-0
          right-0
          top-0
          z-[1000]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-5
            md:px-10
          "
        >
          <div
            className="
              rounded-xl
              bg-white
              px-5
              py-3
              shadow-lg
            "
          >
            <h1
              className="
                text-xl
                font-bold
                text-black
              "
            >
              Rider
            </h1>
          </div>

          <button
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-lg
            "
          >
            👤
          </button>
        </div>
      </header>

      <MapContainer
        center={[22.5726, 88.3639]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          selecting={selecting}
          setPickup={setPickup}
          setDestination={setDestination}
          setSelecting={setSelecting}
        />

        <MapFlyTo
          location={
            selecting === "pickup"
              ? pickup
              : destination
          }
        />

        {pickup && (
          <Marker
            position={[
              pickup.lat,
              pickup.lng,
            ]}
          >
            <Popup>
              <strong>Pickup</strong>
              <br />
              {pickup.address}
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker
            position={[
              destination.lat,
              destination.lng,
            ]}
          >
            <Popup>
              <strong>Destination</strong>
              <br />
              {destination.address}
            </Popup>
          </Marker>
        )}

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "black",
              weight: 5,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          z-[1000]
          md:bottom-6
          md:left-6
          md:right-auto
          md:w-[450px]
        "
      >
        <div
          className="
            rounded-t-3xl
            bg-white
            p-5
            shadow-2xl
            md:rounded-3xl
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              text-gray-900
            "
          >
            Where to?
          </h2>

          <p
            className="
              mb-5
              mt-1
              text-sm
              text-gray-500
            "
          >
            Search or select locations on the map
          </p>

          <div className="mb-3">
            <div
              className="
                mb-1
                text-xs
                font-medium
                text-gray-500
              "
            >
              Pickup location
            </div>

            <LocationSearch
              type="pickup"
              value={pickup}
              onSelect={(location) => {
                setPickup(location);
                setSelecting("destination");
              }}
            />
          </div>

          <div className="mb-3">
            <div
              className="
                mb-1
                text-xs
                font-medium
                text-gray-500
              "
            >
              Destination
            </div>

            <LocationSearch
              type="destination"
              value={destination}
              onSelect={(location) => {
                setDestination(location);
                setSelecting("destination");
              }}
            />
          </div>

          <button
            onClick={handleCurrentLocation}
            disabled={locationLoading}
            className="
              mb-4
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-200
              py-3
              text-sm
              font-medium
              transition
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            📍

            {locationLoading
              ? "Finding your location..."
              : "Use my current location"}
          </button>

          <div
            className="
              mb-4
              rounded-xl
              bg-gray-50
              p-3
              text-center
              text-xs
              text-gray-500
            "
          >
            {selecting === "pickup"
              ? "Click on the map to select pickup"
              : "Click on the map to select destination"}
          </div>

          {loadingRoute && (
            <div
              className="
                mb-4
                rounded-xl
                bg-gray-50
                p-3
                text-center
                text-sm
                text-gray-600
              "
            >
              Calculating route and fare...
            </div>
          )}

          {routeError && (
            <div
              className="
                mb-4
                rounded-xl
                bg-red-50
                p-3
                text-center
                text-sm
                text-red-600
              "
            >
              {routeError}
            </div>
          )}

          {pickup &&
            destination &&
            !loadingRoute &&
            fare !== null && (
              <div
                className="
                  mb-4
                  rounded-2xl
                  bg-black
                  p-5
                  text-white
                "
              >
                <p
                  className="
                    text-sm
                    text-gray-300
                  "
                >
                  Estimated fare
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-bold
                  "
                >
                  ₹{fare.toFixed(0)}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Final fare may vary based on vehicle
                  and captain pricing.
                </p>

                <div
                  className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-3
                    text-sm
                  "
                >
                  <div>
                    <p className="text-gray-400">
                      Distance
                    </p>

                    <p className="font-semibold">
                      {distance?.toFixed(2)} km
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">
                      Duration
                    </p>

                    <p className="font-semibold">
                      {Math.round(duration)} min
                    </p>
                  </div>
                </div>
              </div>
            )}

          <button
            onClick={handleConfirmRide}
            disabled={
              !pickup ||
              !destination ||
              loadingRoute ||
              fare === null
            }
            className="
              w-full
              rounded-xl
              bg-black
              py-4
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loadingRoute
              ? "Calculating..."
              : "Choose Vehicle"}
          </button>

          {(pickup || destination) && (
            <button
              onClick={handleReset}
              className="
                mt-3
                w-full
                rounded-xl
                border
                border-gray-200
                py-3
                text-sm
                font-medium
                hover:bg-gray-50
              "
            >
              Clear locations
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;