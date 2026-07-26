import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RideOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // GET LOCATION DATA FROM RIDE PAGE
  // =====================================================

  const {
    pickup,
    destination,
  } = location.state || {};

  // =====================================================
  // SELECTED RIDE
  // =====================================================

  const [selectedRide, setSelectedRide] =
    useState("riderGo");

  // =====================================================
  // RIDE OPTIONS
  // =====================================================

  const rideOptions = [
    {
      id: "riderGo",
      name: "RiderGo",
      description:
        "Affordable, comfortable rides",
      eta: "2 min",
      seats: 4,
      price: "$12.50",
      image:
        "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
    },

    {
      id: "riderMoto",
      name: "Rider Moto",
      description:
        "Affordable motorcycle rides",
      eta: "3 min",
      seats: 1,
      price: "$5.50",
      image:
        "https://cdn-icons-png.flaticon.com/512/3097/3097180.png",
    },

    {
      id: "riderPremier",
      name: "Rider Premier",
      description:
        "Comfortable sedans with top-quality drivers",
      eta: "4 min",
      seats: 4,
      price: "$15.80",
      image:
        "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
    },

    {
      id: "riderAuto",
      name: "Rider Auto",
      description:
        "Affordable auto rides",
      eta: "2 min",
      seats: 3,
      price: "$8.20",
      image:
        "https://cdn-icons-png.flaticon.com/512/1048/1048329.png",
    },
  ];

  // =====================================================
  // CONFIRM RIDE
  // =====================================================

  const handleConfirmRide = () => {
    const selected = rideOptions.find(
      (ride) => ride.id === selectedRide
    );

    console.log(
      "Selected Ride:",
      selected
    );

    console.log(
      "Pickup:",
      pickup
    );

    console.log(
      "Destination:",
      destination
    );

    // Later:
    // Send this data to your Node.js backend

    alert(
      `${selected.name} selected successfully!`
    );
  };

  // =====================================================
  // IF USER DIRECTLY OPENS THIS PAGE
  // =====================================================

  if (!pickup || !destination) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-5">

        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">

          <h1 className="text-2xl font-bold text-gray-900">
            No ride selected
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Please select your pickup and destination
            first.
          </p>

          <button
            onClick={() => navigate("/ride")}
            className="
              mt-6
              w-full
              rounded-xl
              bg-black
              py-4
              font-semibold
              text-white
              transition
              hover:bg-gray-800
            "
          >
            Select Location
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-white">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-gray-200
          bg-white
        "
      >

        <div
          className="
            mx-auto
            flex
            h-16
            max-w-2xl
            items-center
            justify-between
            px-5
          "
        >

          {/* BACK BUTTON */}

          <button
            onClick={() => navigate(-1)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              transition
              hover:bg-gray-100
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-5 w-5"
            >

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />

            </svg>

          </button>


          {/* LOGO */}

          <h1 className="text-xl font-bold text-black">
            Rider
          </h1>


          {/* EMPTY SPACE */}

          <div className="h-10 w-10" />

        </div>

      </header>


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <main className="mx-auto max-w-2xl px-5 pb-32">

        {/* ================================================= */}
        {/* LOCATION SUMMARY */}
        {/* ================================================= */}

        <section className="py-5">

          <h2 className="text-2xl font-bold text-gray-900">
            Choose a ride
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select the best ride for your trip
          </p>


          {/* LOCATION CARD */}

          <div
            className="
              mt-5
              rounded-2xl
              bg-gray-50
              p-4
            "
          >

            {/* PICKUP */}

            <div className="flex items-start gap-3">

              <div
                className="
                  mt-1
                  h-3
                  w-3
                  rounded-full
                  border-[3px]
                  border-black
                  bg-white
                "
              />

              <div className="min-w-0 flex-1">

                <p className="text-xs text-gray-500">
                  Pickup
                </p>

                <p className="truncate text-sm font-medium text-gray-900">
                  {pickup.address}
                </p>

              </div>

            </div>


            {/* LINE */}

            <div
              className="
                ml-[5px]
                h-5
                border-l-2
                border-dashed
                border-gray-300
              "
            />


            {/* DESTINATION */}

            <div className="flex items-start gap-3">

              <div
                className="
                  mt-1
                  h-3
                  w-3
                  rounded-sm
                  bg-black
                "
              />

              <div className="min-w-0 flex-1">

                <p className="text-xs text-gray-500">
                  Destination
                </p>

                <p className="truncate text-sm font-medium text-gray-900">
                  {destination.address}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* SCHEDULE */}
        {/* ================================================= */}

        <button
          className="
            mb-4
            flex
            items-center
            gap-3
            rounded-xl
            bg-gray-50
            px-4
            py-3
            text-sm
            font-medium
            text-gray-800
            transition
            hover:bg-gray-100
          "
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-5 w-5"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2"
            />

            <circle
              cx="12"
              cy="12"
              r="9"
            />

          </svg>

          Leave now

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="ml-2 h-4 w-4"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />

          </svg>

        </button>


        {/* ================================================= */}
        {/* RIDE OPTIONS */}
        {/* ================================================= */}

        <div className="space-y-2">

          {rideOptions.map((ride) => {

            const isSelected =
              selectedRide === ride.id;

            return (

              <button
                key={ride.id}
                onClick={() =>
                  setSelectedRide(ride.id)
                }
                className={`
                  flex
                  w-full
                  items-center
                  gap-4
                  rounded-2xl
                  border-2
                  px-4
                  py-4
                  text-left
                  transition

                  ${
                    isSelected
                      ? "border-black bg-white shadow-sm"
                      : "border-transparent bg-white hover:bg-gray-50"
                  }
                `}
              >

                {/* ======================================= */}
                {/* VEHICLE IMAGE */}
                {/* ======================================= */}

                <div
                  className="
                    flex
                    h-16
                    w-20
                    shrink-0
                    items-center
                    justify-center
                  "
                >

                  <img
                    src={ride.image}
                    alt={ride.name}
                    className="
                      h-14
                      w-16
                      object-contain
                    "
                  />

                </div>


                {/* ======================================= */}
                {/* RIDE DETAILS */}
                {/* ======================================= */}

                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-2">

                    <h3 className="text-base font-bold text-gray-900">

                      {ride.name}

                    </h3>


                    {/* SEATS */}

                    <span className="flex items-center gap-1 text-xs text-gray-500">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                        />

                      </svg>

                      {ride.seats}

                    </span>

                  </div>


                  <p className="mt-1 text-xs text-gray-600">

                    {ride.eta} away

                  </p>


                  <p className="mt-1 truncate text-xs text-gray-500">

                    {ride.description}

                  </p>

                </div>


                {/* ======================================= */}
                {/* PRICE */}
                {/* ======================================= */}

                <div className="shrink-0">

                  <p className="text-base font-bold text-gray-900">

                    {ride.price}

                  </p>

                </div>

              </button>

            );

          })}

        </div>


        {/* ================================================= */}
        {/* PAYMENT */}
        {/* ================================================= */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-gray-200
            p-4
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-gray-100
              "
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="h-5 w-5"
              >

                <rect
                  width="18"
                  height="14"
                  x="3"
                  y="5"
                  rx="2"
                />

                <path
                  strokeLinecap="round"
                  d="M3 10h18"
                />

              </svg>

            </div>


            <div>

              <p className="text-sm font-semibold">
                Cash
              </p>

              <p className="text-xs text-gray-500">
                Pay after your ride
              </p>

            </div>

          </div>


          <button className="text-sm font-semibold">
            Change
          </button>

        </div>

      </main>


      {/* ================================================= */}
      {/* BOTTOM CONFIRM BUTTON */}
      {/* ================================================= */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          border-t
          border-gray-200
          bg-white
          p-4
        "
      >

        <div className="mx-auto max-w-2xl">

          <button
            onClick={
              handleConfirmRide
            }
            className="
              w-full
              rounded-xl
              bg-black
              py-4
              text-base
              font-bold
              text-white
              transition
              hover:bg-gray-800
              active:scale-[0.99]
            "
          >

            Confirm RiderGo

          </button>

        </div>

      </div>

    </div>
  );
};

export default RideOptions;