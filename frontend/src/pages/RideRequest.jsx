
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RideRequested = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    pickup,
    destination,
    distance,
    duration,
    vehicleType,
    estimatedFare,
    user,
    ride,
  } = location.state || {};

  const [searching, setSearching] = useState(true);
  const [cancelled, setCancelled] = useState(false);

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
      name: "Vehicle",
      icon: "🚗",
      description: "Your selected ride",
    };

  const userName =
    user?.fullname?.firstname && user?.fullname?.lastname
      ? `${user.fullname.firstname} ${user.fullname.lastname}`
      : user?.fullname || user?.name || "User";

  // --------------------------------------------------
  // TEMPORARY FRONTEND SIMULATION
  // --------------------------------------------------
  // Later, this will be replaced with Socket.IO.
  //
  // Backend will notify this page when a captain accepts:
  //
  // socket.on("ride-accepted", (captainData) => {
  //   navigate("/captain-details", {
  //     state: {
  //       ...location.state,
  //       captain: captainData,
  //     },
  //   });
  // });
  //
  // --------------------------------------------------

  useEffect(() => {
    setSearching(true);
  }, []);

  const handleCancelRide = () => {
    setCancelled(true);
    setSearching(false);
  };

  const handleBackHome = () => {
    navigate("/");
  };

  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            <div className="h-10 w-10" />

            <h1 className="text-lg font-bold text-gray-900">
              Ride Cancelled
            </h1>

            <div className="h-10 w-10" />
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl items-center justify-center px-5">
          <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl">
              ✓
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Ride cancelled
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              Your ride request has been cancelled successfully.
            </p>

            <button
              onClick={handleBackHome}
              className="mt-8 w-full rounded-xl bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xl transition hover:bg-gray-100"
          >
            ←
          </button>

          <h1 className="text-lg font-bold text-gray-900">
            Ride Requested
          </h1>

          <div className="h-10 w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-5">
        {/* SEARCHING CAPTAIN CARD */}
        <div className="mb-5 overflow-hidden rounded-3xl bg-black p-6 text-white shadow-lg">
          <div className="flex flex-col items-center text-center">
            {/* Animated loader */}
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full border border-white/20" />

              <div className="absolute inset-3 animate-pulse rounded-full border border-white/30" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl">
                {currentVehicle.icon}
              </div>
            </div>

            <p className="mt-6 text-sm font-medium text-gray-400">
              Ride requested
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Finding your captain...
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
              We are looking for an available{" "}
              {currentVehicle.name.toLowerCase()} captain
              near your pickup location.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>

        {/* RIDE SUMMARY */}
        <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Your ride
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                {currentVehicle.name}
              </h2>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
              {currentVehicle.icon}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">
                Estimated fare
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                ₹
                {estimatedFare
                  ? Number(estimatedFare).toFixed(0)
                  : "0"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">
                Payment
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                Cash
              </p>
            </div>
          </div>
        </div>

        {/* LOCATION CARD */}
        <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Trip details
          </p>

          <div className="mt-5 flex gap-4">
            {/* Route line */}
            <div className="flex flex-col items-center">
              <div className="mt-1 h-3 w-3 rounded-full bg-black" />

              <div className="h-16 w-px bg-gray-300" />

              <div className="h-3 w-3 rounded-full border-2 border-black bg-white" />
            </div>

            {/* Addresses */}
            <div className="min-w-0 flex-1">
              <div className="mb-7">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pickup
                </p>

                <p className="truncate text-sm font-semibold text-gray-900">
                  {pickup?.address ||
                    "Pickup location"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Destination
                </p>

                <p className="truncate text-sm font-semibold text-gray-900">
                  {destination?.address ||
                    "Destination"}
                </p>
              </div>
            </div>
          </div>

          {/* Trip stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
            <div>
              <p className="text-xs text-gray-400">
                Distance
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {distance
                  ? `${Number(distance).toFixed(2)} km`
                  : "--"}
              </p>
            </div>

            <div>
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

        {/* PASSENGER CARD */}
        <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Passenger
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-bold text-gray-900">
                {userName}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Your ride request is active
              </p>
            </div>
          </div>
        </div>

        {/* STATUS INFORMATION */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
              🔔
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">
                What happens next?
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Nearby {currentVehicle.name.toLowerCase()}{" "}
                captains will receive your request.
                Once a captain accepts, you will see
                their details here.
              </p>
            </div>
          </div>
        </div>

        {/* TEMPORARY DEV INFO */}
        {ride && (
          <div className="rounded-2xl bg-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500">
              Ride Request ID
            </p>

            <p className="mt-1 break-all text-xs text-gray-700">
              {ride._id || ride.id || "Processing..."}
            </p>
          </div>
        )}
      </main>

      {/* CANCEL BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-2xl">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={handleCancelRide}
            disabled={!searching}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideRequested;
