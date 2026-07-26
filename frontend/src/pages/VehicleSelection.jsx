import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VehicleSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    pickup,
    destination,
    distance,
    duration,
    estimatedFare,
  } = location.state || {};

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const vehicles = [
    {
      id: "car",
      name: "Car",
      vehicleType: "car",
      description: "Comfortable ride for everyday travel",
      seats: 4,
      icon: "🚗",
      fareMultiplier: 1.2,
    },
    {
      id: "motorcycle",
      name: "Bike",
      vehicleType: "motorcycle",
      description: "Quick and affordable for solo trips",
      seats: 1,
      icon: "🏍️",
      fareMultiplier: 0.7,
    },
    {
      id: "auto",
      name: "Auto",
      vehicleType: "auto",
      description: "Affordable ride for short and medium trips",
      seats: 3,
      icon: "🛺",
      fareMultiplier: 0.9,
    },
  ];

  const calculateFare = (vehicle) => {
    if (!estimatedFare) {
      return 0;
    }

    return Number(estimatedFare) * vehicle.fareMultiplier;
  };

  const handleConfirmRide = () => {
    if (!selectedVehicle) {
      return;
    }

    navigate("/confirm-ride", {
      state: {
        pickup,
        destination,
        distance,
        duration,
        vehicle: selectedVehicle,
        vehicleType: selectedVehicle.vehicleType,
        estimatedFare: calculateFare(selectedVehicle),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-32">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xl transition hover:bg-gray-100"
          >
            ←
          </button>

          <h1 className="text-lg font-bold text-gray-900">
            Choose your ride
          </h1>

          <div className="h-10 w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-5">
        <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Your trip
              </p>

              <h2 className="mt-1 text-lg font-bold text-gray-900">
                Select a vehicle
              </h2>
            </div>

            {distance && duration && (
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {Number(distance).toFixed(1)} km
                </p>

                <p className="text-xs text-gray-500">
                  {Math.round(duration)} min
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="mt-1 h-3 w-3 rounded-full bg-black" />

              <div className="h-12 w-px bg-gray-300" />

              <div className="h-3 w-3 rounded-full border-2 border-black bg-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-5">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pickup
                </p>

                <p className="truncate text-sm font-medium text-gray-900">
                  {pickup?.address || "Pickup location"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Destination
                </p>

                <p className="truncate text-sm font-medium text-gray-900">
                  {destination?.address || "Destination"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Choose your ride
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Pick the vehicle that works best for you
          </p>
        </div>

        <div className="space-y-3">
          {vehicles.map((vehicle) => {
            const isSelected =
              selectedVehicle?.id === vehicle.id;

            const fare = calculateFare(vehicle);

            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => setSelectedVehicle(vehicle)}
                className={`w-full rounded-3xl border-2 bg-white p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-black shadow-xl"
                    : "border-transparent shadow-sm hover:border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl transition ${
                      isSelected
                        ? "bg-gray-100"
                        : "bg-[#f5f5f5]"
                    }`}
                  >
                    <span className="text-5xl">
                      {vehicle.icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {vehicle.name}
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                          {vehicle.description}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{fare.toFixed(0)}
                        </p>

                        <p className="text-[10px] text-gray-400">
                          estimated
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        👤 {vehicle.seats}{" "}
                        {vehicle.seats === 1
                          ? "Passenger"
                          : "Passengers"}
                      </span>

                      <span className="text-xs font-medium text-gray-400">
                        {vehicle.vehicleType}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      isSelected
                        ? "border-black bg-black"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-xs font-bold text-white">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
              ℹ️
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Fare is estimated
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                The final fare may vary based on the captain,
                traffic, route changes, and other ride conditions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {selectedVehicle && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <span className="text-3xl">
                {selectedVehicle.icon}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">
                Selected ride
              </p>

              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">
                  {selectedVehicle.name}
                </p>

                <span className="text-gray-300">•</span>

                <p className="text-sm font-semibold text-gray-700">
                  ₹
                  {calculateFare(
                    selectedVehicle
                  ).toFixed(0)}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmRide}
              className="rounded-xl bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-gray-800 active:scale-95"
            >
              Confirm Ride
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSelection;