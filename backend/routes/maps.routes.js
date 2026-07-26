const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("express-validator");

const {
    getCoordinates,
    getRoute
} = require("../Controllers/map.controllers");


// Get coordinates from address
router.get(
    "/get-coordinates",

    query("address")
        .isString()
        .isLength({ min: 3 }),

    authMiddleware.authUser,

    getCoordinates
);


// Get route between pickup and destination
router.get(
    "/get-route",

    authMiddleware.authUser,

    getRoute
);


module.exports = router;