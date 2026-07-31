const rideModel = require("../Models/ride.model.js");
const captainModel = require("../Models/Captain.model.js");


// =====================================================
// CREATE RIDE
// =====================================================

module.exports.createRide = async (req, res) => {
  try {
    console.log("========== CREATE RIDE ==========");

    const {
      pickup,
      destination,
      distance,
      duration,
      vehicleType,
      estimatedFare,
    } = req.body;


    // =====================================================
    // CHECK AUTHENTICATED USER
    // =====================================================

    if (!req.user) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!pickup) {
      return res.status(400).json({
        message: "Pickup is required",
      });
    }

    if (!destination) {
      return res.status(400).json({
        message: "Destination is required",
      });
    }

    if (!vehicleType) {
      return res.status(400).json({
        message: "Vehicle type is required",
      });
    }

    if (
      estimatedFare === undefined ||
      estimatedFare === null
    ) {
      return res.status(400).json({
        message: "Estimated fare is required",
      });
    }


    // =====================================================
    // CREATE RIDE
    // =====================================================

    const ride = await rideModel.create({
      user: req.user._id,

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

      // status automatically becomes:
      // "searching"
    });


    console.log(
      "Ride created successfully:",
      ride._id
    );


    // =====================================================
    // FIND MATCHING ACTIVE CAPTAINS
    // =====================================================

    const captains = await captainModel.find({
      status: "active",
      "vehicle.vehicleType": vehicleType,
    });


    console.log(
      `Found ${captains.length} matching captains`
    );


    // =====================================================
    // SEND RIDE REQUEST TO MATCHING CAPTAINS
    // =====================================================

    const io = req.app.get("io");

    if (io) {

      captains.forEach((captain) => {

        if (captain.socketId) {

          io.to(captain.socketId).emit(
            "new-ride-request",
            {
              rideId: ride._id,

              pickup: ride.pickup,

              destination: ride.destination,

              distance: ride.distance,

              duration: ride.duration,

              vehicleType: ride.vehicleType,

              estimatedFare:
                ride.estimatedFare,
            }
          );

        }

      });

    }


    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      message: "Ride created successfully",
      ride,
    });


  } catch (error) {

    console.error(
      "========== CREATE RIDE ERROR =========="
    );

    console.error(error);

    return res.status(500).json({
      message: "Unable to create ride",
      error: error.message,
    });

  }
};



// =====================================================
// ACCEPT RIDE
// =====================================================

module.exports.acceptRide = async (req, res) => {

  try {

    console.log("========== ACCEPT RIDE ==========");


    // =====================================================
    // GET RIDE ID
    // =====================================================

    const { rideId } = req.params;


    // =====================================================
    // CHECK AUTHENTICATED CAPTAIN
    // =====================================================

    if (!req.captain) {

      return res.status(401).json({
        message: "Captain is not authenticated",
      });

    }


    console.log(
      "Captain ID:",
      req.captain._id
    );


    console.log(
      "Ride ID:",
      rideId
    );


    // =====================================================
    // FIND RIDE
    // =====================================================

    const ride = await rideModel.findById(
      rideId
    );


    if (!ride) {

      return res.status(404).json({
        message: "Ride not found",
      });

    }


    // =====================================================
    // CHECK RIDE STATUS
    // =====================================================

    if (ride.status !== "searching") {

      return res.status(400).json({
        message:
          "This ride is no longer available",
      });

    }


    // =====================================================
    // CHECK VEHICLE TYPE
    // =====================================================

    if (
      ride.vehicleType !==
      req.captain.vehicle.vehicleType
    ) {

      return res.status(403).json({
        message:
          "Your vehicle type does not match this ride",
      });

    }


    // =====================================================
    // ATOMIC ACCEPT
    // =====================================================

    /*
      Important:

      Only one captain can accept the ride.

      The query checks that the ride is still
      "searching".

      If another captain accepts first,
      this update will return null.
    */

    const acceptedRide =
      await rideModel.findOneAndUpdate(

        {
          _id: rideId,

          status: "searching",

          vehicleType:
            req.captain.vehicle.vehicleType,
        },

        {
          $set: {
            captain:
              req.captain._id,

            status:
              "accepted",
          },
        },

        {
  returnDocument: "after",
}

      );


    // =====================================================
    // RIDE ALREADY ACCEPTED
    // =====================================================

    if (!acceptedRide) {

      return res.status(409).json({
        message:
          "Sorry, another captain has already accepted this ride",
      });

    }


    console.log(
      "Ride accepted successfully:",
      acceptedRide._id
    );


    // =====================================================
    // GET SOCKET.IO
    // =====================================================

    const io = req.app.get("io");


    // =====================================================
    // SEND ACCEPTED EVENT
    // =====================================================

    /*
      This part requires the User model
      to have socketId.

      Example:

      socketId: {
        type: String,
        default: null
      }
    */

    if (io) {

      const populatedRide =
        await rideModel
          .findById(acceptedRide._id)
          .populate("user")
          .populate("captain");


      const user =
        populatedRide.user;


      // User must have an active socket
      if (
        user &&
        user.socketId
      ) {

        io.to(
          user.socketId
        ).emit(
          "ride-accepted",
          {
            rideId:
              populatedRide._id,

            ride:
              populatedRide,

            captain:
              populatedRide.captain,
          }
        );

      }

    }


    // =====================================================
    // RESPONSE TO CAPTAIN
    // =====================================================

    return res.status(200).json({

      message:
        "Ride accepted successfully",

      ride:
        acceptedRide,

    });


  } catch (error) {

    console.error(
      "========== ACCEPT RIDE ERROR =========="
    );

    console.error(error);


    return res.status(500).json({

      message:
        "Unable to accept ride",

      error:
        error.message,

    });

  }

};

// =====================================================
// UPDATE CAPTAIN ETA
// =====================================================

module.exports.updateCaptainEta = async (req, res) => {
  try {
    console.log("========== UPDATE CAPTAIN ETA ==========");

    const { rideId } = req.params;
    const { eta } = req.body;

    // =====================================================
    // CHECK AUTHENTICATED CAPTAIN
    // =====================================================

    if (!req.captain) {
      return res.status(401).json({
        message: "Captain is not authenticated",
      });
    }

    // =====================================================
    // VALIDATE ETA
    // =====================================================

    if (
      eta === undefined ||
      eta === null ||
      Number(eta) <= 0
    ) {
      return res.status(400).json({
        message: "Please provide a valid ETA",
      });
    }

    // =====================================================
    // FIND RIDE
    // =====================================================

    const ride = await rideModel
      .findOne({
        _id: rideId,
        captain: req.captain._id,
      })
      .populate("user")
      .populate("captain");

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    // =====================================================
    // CHECK RIDE STATUS
    // =====================================================

    if (ride.status !== "accepted") {
      return res.status(400).json({
        message:
          "ETA can only be updated for an accepted ride",
      });
    }

    // =====================================================
    // UPDATE ETA
    // =====================================================

    ride.captainEta = Number(eta);

    await ride.save();

    console.log(
      `Captain ETA updated to ${ride.captainEta} minutes`
    );

    // =====================================================
    // SEND ETA TO USER USING SOCKET.IO
    // =====================================================

    const io = req.app.get("io");

    if (
      io &&
      ride.user &&
      ride.user.socketId
    ) {
      io.to(ride.user.socketId).emit(
        "captain-eta-updated",
        {
          rideId: ride._id,
          eta: ride.captainEta,
        }
      );

      console.log(
        "ETA sent to user successfully"
      );
    } else {
      console.log(
        "User socket not available"
      );
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      message: "ETA updated successfully",
      eta: ride.captainEta,
      ride,
    });

  } catch (error) {
    console.error(
      "========== UPDATE ETA ERROR =========="
    );

    console.error(error);

    return res.status(500).json({
      message: "Unable to update ETA",
      error: error.message,
    });
  }
};
// =====================================================
// UPDATE RIDE STATUS
// =====================================================

module.exports.updateRideStatus = async (req, res) => {
  try {
    console.log("========== UPDATE RIDE STATUS ==========");

    const { rideId } = req.params;
    const { status } = req.body;

    // =====================================================
    // CHECK AUTHENTICATED CAPTAIN
    // =====================================================

    if (!req.captain) {
      return res.status(401).json({
        message: "Captain is not authenticated",
      });
    }

    // =====================================================
    // VALID STATUS VALUES
    // =====================================================

    const allowedStatuses = [
      "accepted",
      "captain_arrived",
      "started",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid ride status",
      });
    }

    // =====================================================
    // FIND RIDE
    // =====================================================

    const ride = await rideModel.findOne({
      _id: rideId,
      captain: req.captain._id,
    });

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found or ride does not belong to you",
      });
    }

    // =====================================================
    // CHECK VALID STATUS TRANSITIONS
    // =====================================================

    if (
      status === "captain_arrived" &&
      ride.status !== "accepted"
    ) {
      return res.status(400).json({
        message:
          "Captain can mark arrived only after accepting the ride",
      });
    }

    if (
      status === "started" &&
      ride.status !== "captain_arrived"
    ) {
      return res.status(400).json({
        message:
          "Ride can start only after captain arrives",
      });
    }

    if (
      status === "completed" &&
      ride.status !== "started"
    ) {
      return res.status(400).json({
        message:
          "Ride can be completed only after it has started",
      });
    }

    // =====================================================
    // UPDATE RIDE
    // =====================================================

    ride.status = status;

    // When captain arrives, ETA becomes 0
    if (status === "captain_arrived") {
      ride.captainEta = 0;
    }

    await ride.save();

    // =====================================================
    // POPULATE USER AND CAPTAIN
    // =====================================================

    const updatedRide = await rideModel
      .findById(ride._id)
      .populate("user")
      .populate("captain");

    console.log(
      "Ride status updated:",
      updatedRide.status
    );

    // =====================================================
    // SOCKET.IO
    // =====================================================

    const io = req.app.get("io");

    if (
      io &&
      updatedRide.user &&
      updatedRide.user.socketId
    ) {
      io.to(
        updatedRide.user.socketId
      ).emit(
        "ride-status-updated",
        {
          rideId: updatedRide._id,
          status: updatedRide.status,
          captainEta: updatedRide.captainEta,
          ride: updatedRide,
        }
      );

      console.log(
        "Ride status sent to user"
      );
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      message: "Ride status updated successfully",

      ride: updatedRide,
    });

  } catch (error) {
    console.error(
      "========== UPDATE RIDE STATUS ERROR =========="
    );

    console.error(error);

    return res.status(500).json({
      message: "Unable to update ride status",
      error: error.message,
    });
  }
 };
module.exports.updateCaptainLocation = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { lat, lng } = req.body;

    if (!req.captain) {
      return res.status(401).json({
        message: "Captain is not authenticated",
      });
    }

    if (
      lat === undefined ||
      lng === undefined ||
      Number.isNaN(Number(lat)) ||
      Number.isNaN(Number(lng))
    ) {
      return res.status(400).json({
        message: "Valid latitude and longitude are required",
      });
    }

    const ride = await rideModel
      .findOne({
        _id: rideId,
        captain: req.captain._id,
      })
      .populate("user")
      .populate("captain");

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found or ride does not belong to you",
      });
    }

    if (
      ride.status === "completed" ||
      ride.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Location cannot be updated for this ride",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    ride.captain.vehicle.location = {
      lat: latitude,
      lng: longitude,
    };

    await ride.captain.save();

    const io = req.app.get("io");

    if (
      io &&
      ride.user &&
      ride.user.socketId
    ) {
      io.to(ride.user.socketId).emit(
        "captain-location-updated",
        {
          rideId: ride._id,
          captainId: ride.captain._id,
          location: {
            lat: latitude,
            lng: longitude,
          },
        }
      );
    }

    return res.status(200).json({
      message: "Captain location updated successfully",
      location: {
        lat: latitude,
        lng: longitude,
      },
    });

  } catch (error) {
    console.error(
      "========== UPDATE CAPTAIN LOCATION ERROR =========="
    );

    console.error(error);

    return res.status(500).json({
      message: "Unable to update captain location",
      error: error.message,
    });
  }
};