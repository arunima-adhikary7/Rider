require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./db/db.js");

const captainModel = require("./Models/captain.model.js");
const userModel = require("./Models/User.model.js");

// =====================================================
// CONNECT DATABASE
// =====================================================

connectDB();

// =====================================================
// PORT
// =====================================================

const PORT = process.env.PORT || 3000;

// =====================================================
// CREATE HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// =====================================================
// MAKE IO AVAILABLE INSIDE CONTROLLERS
// =====================================================

app.set("io", io);

// =====================================================
// SOCKET CONNECTION
// =====================================================

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  // ===================================================
  // CAPTAIN JOINS
  // ===================================================

  socket.on(
    "join-captain",
    async (captainId) => {
      try {
        if (!captainId) {
          console.log(
            "Captain ID missing"
          );

          return;
        }

        console.log(
          `Captain ${captainId} connected with socket ${socket.id}`
        );

        const captain =
          await captainModel.findByIdAndUpdate(
            captainId,
            {
              $set: {
                socketId: socket.id,
                status: "active",
              },
            },
            {
              new: true,
            }
          );

        if (!captain) {
          console.log(
            "Captain not found:",
            captainId
          );

          return;
        }

        console.log(
          "Captain socketId updated successfully"
        );
      } catch (error) {
        console.error(
          "Captain socket error:",
          error
        );
      }
    }
  );

  // ===================================================
  // USER JOINS
  // ===================================================

  socket.on(
    "join-user",
    async (userId) => {
      try {
        if (!userId) {
          console.log(
            "User ID missing"
          );

          return;
        }

        console.log(
          `User ${userId} connected with socket ${socket.id}`
        );

        const user =
          await userModel.findByIdAndUpdate(
            userId,
            {
              $set: {
                socketId: socket.id,
              },
            },
            {
              new: true,
            }
          );

        if (!user) {
          console.log(
            "User not found:",
            userId
          );

          return;
        }

        console.log(
          "User socketId updated successfully"
        );
      } catch (error) {
        console.error(
          "User socket error:",
          error
        );
      }
    }
  );

  // ===================================================
  // USER JOINS RIDE ROOM
  // ===================================================

  socket.on(
    "join-ride",
    async ({
      rideId,
      userId,
    }) => {
      try {
        if (!rideId) {
          console.log(
            "Ride ID missing"
          );

          return;
        }

        // =============================================
        // SAME ROOM FOR USER + CAPTAIN
        // =============================================

        const roomName =
          `ride-${rideId}`;

        socket.join(
          roomName
        );

        console.log(
          `Socket ${socket.id} joined ride room ${roomName}`
        );

        // =============================================
        // UPDATE USER SOCKET ID
        // =============================================

        if (userId) {
          await userModel.findByIdAndUpdate(
            userId,
            {
              $set: {
                socketId: socket.id,
              },
            }
          );

          console.log(
            "User socketId updated from ride room"
          );
        }
      } catch (error) {
        console.error(
          "Join ride error:",
          error
        );
      }
    }
  );

  // ===================================================
  // CAPTAIN JOINS RIDE ROOM
  // ===================================================

  socket.on(
    "join-captain-ride",
    ({
      rideId,
    }) => {
      try {
        if (!rideId) {
          console.log(
            "Ride ID missing for captain"
          );

          return;
        }

        // =============================================
        // IMPORTANT
        // SAME ROOM AS USER
        // =============================================

        const roomName =
          `ride-${rideId}`;

        socket.join(
          roomName
        );

        console.log(
          `Captain socket ${socket.id} joined ride room ${roomName}`
        );
      } catch (error) {
        console.error(
          "Captain join ride error:",
          error
        );
      }
    }
  );

  // ===================================================
  // USER LIVE LOCATION UPDATE
  // USER -> SERVER -> CAPTAIN
  // ===================================================

  socket.on(
    "user-location-update",
    ({
      rideId,
      userId,
      lat,
      lng,
    }) => {
      try {
        console.log(
          "User location received:",
          {
            rideId,
            userId,
            lat,
            lng,
          }
        );

        // =============================================
        // VALIDATION
        // =============================================

        if (
          !rideId ||
          lat === undefined ||
          lng === undefined
        ) {
          console.log(
            "Invalid user location data"
          );

          return;
        }

        const latitude =
          Number(lat);

        const longitude =
          Number(lng);

        if (
          Number.isNaN(latitude) ||
          Number.isNaN(longitude)
        ) {
          console.log(
            "Invalid user latitude or longitude"
          );

          return;
        }

        // =============================================
        // USER LOCATION DATA
        // =============================================

        const locationData = {
          rideId,
          userId,

          location: {
            lat: latitude,
            lng: longitude,
          },
        };

        // =============================================
        // SEND USER LOCATION
        // TO CAPTAIN IN SAME RIDE ROOM
        // =============================================

        io.to(
          `ride-${rideId}`
        ).emit(
          "user-location-update",
          locationData
        );

        console.log(
          `User location sent to ride ${rideId}:`,
          latitude,
          longitude
        );
      } catch (error) {
        console.error(
          "User location update error:",
          error
        );
      }
    }
  );

  // ===================================================
  // CAPTAIN LIVE LOCATION UPDATE
  // CAPTAIN -> SERVER -> USER
  // ===================================================

  socket.on(
    "captain-location-update",
    async ({
      rideId,
      captainId,
      lat,
      lng,
    }) => {
      try {
        // =============================================
        // VALIDATE REQUIRED DATA
        // =============================================

        if (
          !rideId ||
          !captainId ||
          lat === undefined ||
          lng === undefined
        ) {
          console.log(
            "Invalid captain location data"
          );

          return;
        }

        // =============================================
        // CONVERT COORDINATES
        // =============================================

        const latitude =
          Number(lat);

        const longitude =
          Number(lng);

        // =============================================
        // VALIDATE COORDINATES
        // =============================================

        if (
          Number.isNaN(latitude) ||
          Number.isNaN(longitude)
        ) {
          console.log(
            "Invalid latitude or longitude"
          );

          return;
        }

        // =============================================
        // UPDATE CAPTAIN LOCATION IN MONGODB
        // =============================================

        const updatedCaptain =
          await captainModel.findByIdAndUpdate(
            captainId,
            {
              $set: {
                "vehicle.location.lat":
                  latitude,

                "vehicle.location.lng":
                  longitude,

                status:
                  "active",
              },
            },
            {
              new: true,
            }
          );

        // =============================================
        // CAPTAIN NOT FOUND
        // =============================================

        if (!updatedCaptain) {
          console.log(
            "Captain not found:",
            captainId
          );

          return;
        }

        // =============================================
        // LOCATION DATA
        // =============================================

        const locationData = {
          rideId,

          captainId,

          location: {
            lat: latitude,
            lng: longitude,
          },
        };

        // =============================================
        // SEND CAPTAIN LOCATION
        // TO USER + CAPTAIN
        // =============================================

        io.to(
          `ride-${rideId}`
        ).emit(
          "captain-location-update",
          locationData
        );

        console.log(
          `Captain ${captainId} location updated:`,
          latitude,
          longitude
        );
      } catch (error) {
        console.error(
          "Captain location update error:",
          error
        );
      }
    }
  );

  // ===================================================
  // RIDE STATUS UPDATE
  // ===================================================

  socket.on(
    "ride-status-update",
    ({
      rideId,
      status,
      ride,
    }) => {
      try {
        if (!rideId) {
          console.log(
            "Ride ID missing"
          );

          return;
        }

        io.to(
          `ride-${rideId}`
        ).emit(
          "ride-status-updated",
          {
            rideId,
            status,
            ride,
          }
        );

        console.log(
          `Ride ${rideId} status updated to ${status}`
        );
      } catch (error) {
        console.error(
          "Ride status socket error:",
          error
        );
      }
    }
  );

  // ===================================================
  // CAPTAIN ETA UPDATE
  // ===================================================

  socket.on(
    "captain-eta-update",
    ({
      rideId,
      eta,
    }) => {
      try {
        if (!rideId) {
          console.log(
            "Ride ID missing"
          );

          return;
        }

        io.to(
          `ride-${rideId}`
        ).emit(
          "captain-eta-updated",
          {
            rideId,
            eta,
          }
        );

        console.log(
          `Captain ETA updated for ride ${rideId}: ${eta} minutes`
        );
      } catch (error) {
        console.error(
          "Captain ETA socket error:",
          error
        );
      }
    }
  );

  // ===================================================
  // DISCONNECT
  // ===================================================

  socket.on(
    "disconnect",
    async () => {
      console.log(
        "Socket disconnected:",
        socket.id
      );

      try {
        // =============================================
        // CAPTAIN OFFLINE
        // =============================================

        const captain =
          await captainModel.findOneAndUpdate(
            {
              socketId:
                socket.id,
            },
            {
              $set: {
                socketId:
                  null,

                status:
                  "inactive",
              },
            },
            {
              new: true,
            }
          );

        if (captain) {
          console.log(
            `Captain ${captain._id} marked inactive`
          );
        }

        // =============================================
        // USER SOCKET CLEANUP
        // =============================================

        const user =
          await userModel.findOneAndUpdate(
            {
              socketId:
                socket.id,
            },
            {
              $set: {
                socketId:
                  null,
              },
            },
            {
              new: true,
            }
          );

        if (user) {
          console.log(
            `User ${user._id} socketId removed`
          );
        }

        console.log(
          "Socket cleanup completed"
        );
      } catch (error) {
        console.error(
          "Disconnect error:",
          error
        );
      }
    }
  );
});

// =====================================================
// START SERVER
// =====================================================

server.listen(
  PORT,
  () => {
    console.log(
      `Server is running on port ${PORT}`
    );
  }
);