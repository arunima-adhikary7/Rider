const express = require("express");

const router = express.Router();

const rideController = require("../Controllers/ride.controllers.js");

const {
  authUser,
  authCaptain,
} = require("../middleware/auth.middleware.js");


// =====================================================
// USER CREATES RIDE
// =====================================================

router.post(
  "/create",
  authUser,
  rideController.createRide
);


// =====================================================
// CAPTAIN ACCEPTS RIDE
// =====================================================

router.post(
  "/:rideId/accept",
  authCaptain,
  rideController.acceptRide
);

router.patch(
  "/:rideId/eta",
  authCaptain,
  rideController.updateCaptainEta
);

router.patch(
  "/:rideId/status",
  authCaptain,
  rideController.updateRideStatus
);
module.exports = router;