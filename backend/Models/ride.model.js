const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER WHO REQUESTED THE RIDE
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },


    // ==========================================
    // CAPTAIN WHO ACCEPTED THE RIDE
    // ==========================================

    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "captain",
      default: null,
    },


    // ==========================================
    // PICKUP LOCATION
    // ==========================================

    pickup: {
      lat: {
        type: Number,
        required: true,
      },

      lng: {
        type: Number,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },
    },


    // ==========================================
    // DESTINATION LOCATION
    // ==========================================

    destination: {
      lat: {
        type: Number,
        required: true,
      },

      lng: {
        type: Number,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },
    },


    // ==========================================
    // DISTANCE
    // ==========================================

    distance: {
      type: Number,
      required: true,
    },


    // ==========================================
    // ESTIMATED DURATION
    // ==========================================

    duration: {
      type: Number,
      required: true,
    },


    // ==========================================
    // SELECTED VEHICLE TYPE
    // ==========================================

    vehicleType: {
      type: String,
      enum: [
        "car",
        "motorcycle",
        "auto",
      ],
      required: true,
    },


    // ==========================================
    // ESTIMATED FARE
    // ==========================================

    estimatedFare: {
      type: Number,
      required: true,
    },


    // ==========================================
    // RIDE STATUS
    // ==========================================

    status: {
      type: String,

      enum: [
        "searching",
        "accepted",
        "started",
        "completed",
        "cancelled",
      ],

      // IMPORTANT:
      // When user requests ride,
      // ride starts in searching state.

      default: "searching",
    },
  },

  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "ride",
  rideSchema
);