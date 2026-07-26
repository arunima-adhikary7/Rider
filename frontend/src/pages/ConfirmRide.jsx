import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ConfirmRide = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    pickup,
    destination,
    distance,
    duration,
    vehicle,
    vehicleType,
    estimatedFare,
  } = location.state || {};

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingUser(true);

        const response = await fetch(
          "http://localhost:3000/users/profile",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch user information");
        }

        const data = await response.json();

        setUser(data.user || data);
      } catch (error) {
        console.error("User fetch error:", error);
        setError("Unable to load user information.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const vehicleDetails = {
    car: {
      name: "Car",
      icon: "🚗",
      description: "Comfortable ride for up to 4 passengers",
    },
    motorcycle: {
      name: "Bike",
      icon: "🏍️",
      description: "Fast and affordable ride",
    },
    auto: {
      name: "Auto",
      icon: "🛺",
      description: "Affordable ride for up to 3 passengers",
    },
  };

  const currentVehicle =
    vehicleDetails[vehicleType] || {
      name: vehicle?.name || "Vehicle",
      icon: "🚗",
      description: "Your selected ride",
    };

  const userName =
    user?.fullname?.firstname && user?.fullname?.lastname
      ? `${user.fullname.firstname} ${user.fullname.lastname}`
      : user?.fullname ||
        user?.name ||
        "User";

  const handleRequestRide = async () => {
    if (!pickup || !destination || !vehicleType) {
      setError("Ride information is incomplete.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const rideData = {
        pickup: {
          lat: pickup.lat,
          lng: pickup.lng,
          address: pickup.address,
        },
        destination: {
          lat: destination.lat,
          lng: destination.lng,
          address: destination.address,
        },
        distance,
        duration,
        vehicleType,
        estimatedFare,
      };

      const response = await fetch(
        "http://localhost:3000/rides/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(rideData),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.message || "Unable to request ride."
        );
      }

      const data = await response.json();

      navigate("/ride-requested", {
        state: {
          ...rideData,
          user,
          ride: data.ride || data,
        },
      });
    } catch (error) {
      console.error("Ride request error:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-32">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xl transition hover:bg-gray-100"
          >
            ←
          </button>

          <h1 className="text-lg font-bold text-gray-900">
            Confirm your ride
          </h1>

          <div className="h-10 w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-5">
        <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Passenger
          </p>

          {loadingUser ? (
            <div className="mt-4 animate-pulse">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="mt-3 h-4 w-40 rounded bg-gray-200" />
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-bold text-gray-900">
                  {userName}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Booking this ride
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Trip details
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Where are you going?
            </h2>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="mt-1 h-3 w-3 rounded-full bg-black" />

              <div className="h-16 w-px bg-gray-300" />

              <div className="h-3 w-3 rounded-full border-2 border-black bg-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-7">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pickup
                </p>

                <p className="text-sm font-semibold leading-5 text-gray-900">
                  {pickup?.address ||
                    "Pickup location not available"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Destination
                </p>

                <p className="text-sm font-semibold leading-5 text-gray-900">
                  {destination?.address ||
                    "Destination not available"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">
                Distance
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {distance
                  ? `${Number(distance).toFixed(2)} km`
                  : "--"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">
                Estimated time
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {duration
                  ? `${Math.round(duration)} min`
                  : "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Your ride
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Selected vehicle
              </h2>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-sm font-semibold text-gray-600 underline"
            >
              Change
            </button>
          </div>

          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
            <div className="flex h-20 w-24 items-center justify-center rounded-2xl bg-white text-5xl shadow-sm">
              {currentVehicle.icon}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                {currentVehicle.name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {currentVehicle.description}
              </p>

              <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-gray-600">
                {vehicleType}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-3xl bg-black p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Estimated fare
              </p>

              <p className="mt-1 text-3xl font-bold">
                ₹
                {estimatedFare
                  ? Number(estimatedFare).toFixed(0)
                  : "0"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">
                Payment
              </p>

              <p className="mt-1 font-semibold">
                Cash
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs leading-5 text-gray-400">
              This is an estimated fare. The final fare
              may be different based on the actual ride.
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
              🔔
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">
                How it works
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                After you request a ride, available captains
                with a matching vehicle type will receive
                your ride request.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-2xl">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">
              {currentVehicle.name} ride
            </p>

            <p className="text-lg font-bold text-gray-900">
              ₹
              {estimatedFare
                ? Number(estimatedFare).toFixed(0)
                : "0"}
            </p>
          </div>

          <button
            onClick={handleRequestRide}
            disabled={
              loading ||
              loadingUser ||
              !pickup ||
              !destination ||
              !vehicleType
            }
            className="rounded-xl bg-black px-7 py-4 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Requesting..."
              : "Request Ride"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRide;