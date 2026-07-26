const axios = require("axios");

// Address -> Coordinates
module.exports.getAddressCordinates = async (address) => {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: address,
                    format: "json",
                    limit: 1
                },
                headers: {
                    "User-Agent": "RiderApp/1.0"
                }
            }
        );

        if (!response.data || response.data.length === 0) {
            throw new Error("Address not found");
        }

        const location = response.data[0];

        return {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon)
        };

    } catch (error) {
        console.error("Geocoding Error:", error.message);
        throw error;
    }
};


// Get route between two coordinates using OSRM
module.exports.getDistanceTime = async (
    origin,
    destination
) => {
    try {
        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${origin.lng},${origin.lat};` +
            `${destination.lng},${destination.lat}`;

        const response = await axios.get(url, {
            params: {
                overview: "full",
                geometries: "geojson"
            }
        });

        if (
            !response.data ||
            response.data.code !== "Ok" ||
            response.data.routes.length === 0
        ) {
            throw new Error("Unable to find route");
        }

        const route = response.data.routes[0];

        return {
            distance: route.distance,
            duration: route.duration,
            distanceInKm: route.distance / 1000,
            durationInMinutes: route.duration / 60,
            geometry: route.geometry
        };

    } catch (error) {
        console.error("Routing Error:", error.message);
        throw error;
    }
};