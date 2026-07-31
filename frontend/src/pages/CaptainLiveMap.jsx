import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";

import "leaflet/dist/leaflet.css";


// =====================================================
// FIX DEFAULT LEAFLET MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// =====================================================
// CAPTAIN CUSTOM ICON
// =====================================================

const captainIcon = new L.DivIcon({
  className: "captain-marker",

  html: `
    <div
      style="
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: #000;
        border: 4px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
      "
    >
      🚗
    </div>
  `,

  iconSize: [45, 45],

  iconAnchor: [22, 22],

  popupAnchor: [0, -25],
});


// =====================================================
// PICKUP ICON
// =====================================================

const pickupIcon = new L.DivIcon({
  className: "pickup-marker",

  html: `
    <div
      style="
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: white;
        border: 4px solid #000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: bold;
      "
    >
      📍
    </div>
  `,

  iconSize: [35, 35],

  iconAnchor: [17, 17],

  popupAnchor: [0, -20],
});


// =====================================================
// DESTINATION ICON
// =====================================================

const destinationIcon = new L.DivIcon({
  className: "destination-marker",

  html: `
    <div
      style="
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: white;
        border: 4px solid #22c55e;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: bold;
      "
    >
      🏁
    </div>
  `,

  iconSize: [35, 35],

  iconAnchor: [17, 17],

  popupAnchor: [0, -20],
});


// =====================================================
// MAP AUTO CENTER COMPONENT
// =====================================================

const MapAutoCenter = ({
  captainLocation,
}) => {
  const map = useMap();

  useEffect(() => {

    if (
      !captainLocation?.lat ||
      !captainLocation?.lng
    ) {
      return;
    }

    map.flyTo(
      [
        captainLocation.lat,
        captainLocation.lng,
      ],
      15,
      {
        duration: 1,
      }
    );

  }, [
    captainLocation,
    map,
  ]);

  return null;
};


// =====================================================
// FIT ALL LOCATIONS
// =====================================================

const FitMapToLocations = ({
  captainLocation,
  pickup,
  destination,
}) => {

  const map = useMap();

  useEffect(() => {

    const locations = [];

    // Captain location
    if (
      captainLocation?.lat &&
      captainLocation?.lng
    ) {
      locations.push([
        captainLocation.lat,
        captainLocation.lng,
      ]);
    }

    // Pickup location
    if (
      pickup?.lat &&
      pickup?.lng
    ) {
      locations.push([
        pickup.lat,
        pickup.lng,
      ]);
    }

    // Destination location
    if (
      destination?.lat &&
      destination?.lng
    ) {
      locations.push([
        destination.lat,
        destination.lng,
      ]);
    }

    // Need at least 2 points
    if (
      locations.length < 2
    ) {
      return;
    }

    const bounds =
      L.latLngBounds(
        locations
      );

    map.fitBounds(
      bounds,
      {
        padding: [
          50,
          50,
        ],
      }
    );

  }, [
    captainLocation,
    pickup,
    destination,
    map,
  ]);

  return null;
};


// =====================================================
// MAIN COMPONENT
// =====================================================

const CaptainLiveMap = ({
  captainLocation,
  pickup,
  destination,
}) => {

  // ===================================================
  // CHECK CAPTAIN LOCATION
  // ===================================================

  const hasCaptainLocation =
    captainLocation &&
    captainLocation.lat !== undefined &&
    captainLocation.lng !== undefined;


  // ===================================================
  // CHECK PICKUP
  // ===================================================

  const hasPickup =
    pickup &&
    pickup.lat !== undefined &&
    pickup.lng !== undefined;


  // ===================================================
  // CHECK DESTINATION
  // ===================================================

  const hasDestination =
    destination &&
    destination.lat !== undefined &&
    destination.lng !== undefined;


  // ===================================================
  // DEFAULT MAP CENTER
  // ===================================================

  let defaultCenter = [
    22.5726,
    88.3639,
  ];

  // Captain location first
  if (
    hasCaptainLocation
  ) {

    defaultCenter = [
      Number(
        captainLocation.lat
      ),

      Number(
        captainLocation.lng
      ),
    ];

  }

  // Otherwise pickup location
  else if (
    hasPickup
  ) {

    defaultCenter = [
      Number(
        pickup.lat
      ),

      Number(
        pickup.lng
      ),
    ];

  }


  // ===================================================
  // CAPTAIN → PICKUP LINE
  // ===================================================

  const captainToPickupLine =
    hasCaptainLocation &&
    hasPickup
      ? [
          [
            Number(
              captainLocation.lat
            ),

            Number(
              captainLocation.lng
            ),
          ],

          [
            Number(
              pickup.lat
            ),

            Number(
              pickup.lng
            ),
          ],
        ]
      : [];


  // ===================================================
  // PICKUP → DESTINATION LINE
  // ===================================================

  const pickupToDestinationLine =
    hasPickup &&
    hasDestination
      ? [
          [
            Number(
              pickup.lat
            ),

            Number(
              pickup.lng
            ),
          ],

          [
            Number(
              destination.lat
            ),

            Number(
              destination.lng
            ),
          ],
        ]
      : [];


  return (
    <div className="relative h-full w-full">

      {/* =================================================
          MAP
      ================================================= */}

      <MapContainer
        center={
          defaultCenter
        }
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >

        {/* =================================================
            OPENSTREETMAP TILES
        ================================================= */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =================================================
            AUTO CENTER ON CAPTAIN
        ================================================= */}

        <MapAutoCenter
          captainLocation={
            captainLocation
          }
        />


        {/* =================================================
            FIT ALL LOCATIONS
        ================================================= */}

        <FitMapToLocations
          captainLocation={
            captainLocation
          }
          pickup={
            pickup
          }
          destination={
            destination
          }
        />


        {/* =================================================
            CAPTAIN MARKER
        ================================================= */}

        {hasCaptainLocation && (

          <Marker
            position={[
              Number(
                captainLocation.lat
              ),

              Number(
                captainLocation.lng
              ),
            ]}
            icon={
              captainIcon
            }
          >

            <Popup>

              <div className="text-center">

                <p className="font-bold">
                  🚗 Your Captain
                </p>

                <p className="mt-1 text-xs text-gray-500">

                  Latitude:{" "}
                  {Number(
                    captainLocation.lat
                  ).toFixed(6)}

                  <br />

                  Longitude:{" "}
                  {Number(
                    captainLocation.lng
                  ).toFixed(6)}

                </p>

              </div>

            </Popup>

          </Marker>

        )}


        {/* =================================================
            PICKUP MARKER
        ================================================= */}

        {hasPickup && (

          <Marker
            position={[
              Number(
                pickup.lat
              ),

              Number(
                pickup.lng
              ),
            ]}
            icon={
              pickupIcon
            }
          >

            <Popup>

              <div>

                <p className="font-bold">
                  📍 Pickup Location
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {pickup.address ||
                    "Pickup point"}
                </p>

              </div>

            </Popup>

          </Marker>

        )}


        {/* =================================================
            DESTINATION MARKER
        ================================================= */}

        {hasDestination && (

          <Marker
            position={[
              Number(
                destination.lat
              ),

              Number(
                destination.lng
              ),
            ]}
            icon={
              destinationIcon
            }
          >

            <Popup>

              <div>

                <p className="font-bold">
                  🏁 Destination
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {destination.address ||
                    "Destination"}
                </p>

              </div>

            </Popup>

          </Marker>

        )}


        {/* =================================================
            CAPTAIN → PICKUP
        ================================================= */}

        {captainToPickupLine.length >
          0 && (

          <Polyline
            positions={
              captainToPickupLine
            }
            pathOptions={{
              color: "black",
              weight: 4,
              opacity: 0.7,
              dashArray:
                "10, 10",
            }}
          />

        )}


        {/* =================================================
            PICKUP → DESTINATION
        ================================================= */}

        {pickupToDestinationLine.length >
          0 && (

          <Polyline
            positions={
              pickupToDestinationLine
            }
            pathOptions={{
              color: "green",
              weight: 4,
              opacity: 0.7,
            }}
          />

        )}

      </MapContainer>


      {/* =================================================
          LIVE LOCATION BADGE
      ================================================= */}

      <div className="absolute left-4 top-4 z-[1000]">

        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">

          <span className="relative flex h-3 w-3">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />

          </span>

          <span className="text-xs font-bold text-gray-800">
            Captain Live Location
          </span>

        </div>

      </div>


      {/* =================================================
          WAITING FOR CAPTAIN LOCATION
      ================================================= */}

      {!hasCaptainLocation && (

        <div className="absolute bottom-4 left-4 right-4 z-[1000]">

          <div className="rounded-2xl bg-white p-4 shadow-lg">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50">

                <span className="text-lg">
                  📍
                </span>

              </div>

              <div>

                <p className="text-sm font-bold text-gray-900">
                  Waiting for captain location
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  The captain's live location
                  will appear here.
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


export default CaptainLiveMap;