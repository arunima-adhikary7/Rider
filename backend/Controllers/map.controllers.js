const { validationResult } = require("express-validator");
const mapService = require("../Services/maps.service.js");


// Get coordinates from address
module.exports.getCoordinates = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { address } = req.query;

    try {

        const coordinates =
            await mapService.getAddressCordinates(address);

        return res.status(200).json(coordinates);

    } catch (error) {

        console.error("Error getting coordinates:", error);

        return res.status(500).json({
            message: "Unable to find coordinates"
        });
    }
};


// Get route between pickup and destination
module.exports.getRoute = async (req, res) => {

    const {
        pickupLat,
        pickupLng,
        destinationLat,
        destinationLng
    } = req.query;

    if (
        !pickupLat ||
        !pickupLng ||
        !destinationLat ||
        !destinationLng
    ) {
        return res.status(400).json({
            message: "All coordinates are required"
        });
    }

    try {

        const origin = {
            lat: parseFloat(pickupLat),
            lng: parseFloat(pickupLng)
        };

        const destination = {
            lat: parseFloat(destinationLat),
            lng: parseFloat(destinationLng)
        };

        const route = await mapService.getDistanceTime(
            origin,
            destination
        );

        return res.status(200).json(route);

    } catch (error) {

        console.error("Error getting route:", error);

        return res.status(500).json({
            message: "Unable to calculate route"
        });
    }
};