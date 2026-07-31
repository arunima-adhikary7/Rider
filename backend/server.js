require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./db/db");

const captainModel = require("./Models/Captain.model.js");
const userModel = require("./Models/user.model.js");


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


        // -----------------------------------------------
        // SAVE CAPTAIN SOCKET ID
        // -----------------------------------------------

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


        // -----------------------------------------------
        // SAVE USER SOCKET ID
        // -----------------------------------------------

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


        // -----------------------------------------------
        // CREATE ROOM NAME
        // -----------------------------------------------

        const roomName =
          `ride-${rideId}`;


        // -----------------------------------------------
        // JOIN SOCKET ROOM
        // -----------------------------------------------

        socket.join(
          roomName
        );


        console.log(
          `Socket ${socket.id} joined ride room ${roomName}`
        );


        // -----------------------------------------------
        // UPDATE USER SOCKET ID
        // -----------------------------------------------

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


        // -----------------------------------------------
        // CREATE ROOM NAME
        // -----------------------------------------------

        const roomName =
          `ride-${rideId}`;


        // -----------------------------------------------
        // JOIN ROOM
        // -----------------------------------------------

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
  // CAPTAIN LIVE LOCATION UPDATE
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

        // -----------------------------------------------
        // VALIDATE REQUIRED DATA
        // -----------------------------------------------

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


        // -----------------------------------------------
        // CONVERT COORDINATES TO NUMBER
        // -----------------------------------------------

        const latitude =
          Number(lat);

        const longitude =
          Number(lng);


        // -----------------------------------------------
        // VALIDATE COORDINATES
        // -----------------------------------------------

        if (
          Number.isNaN(latitude) ||
          Number.isNaN(longitude)
        ) {

          console.log(
            "Invalid latitude or longitude"
          );

          return;
        }


        // -----------------------------------------------
        // UPDATE CAPTAIN LOCATION IN MONGODB
        // -----------------------------------------------

        const updatedCaptain =
          await captainModel.findByIdAndUpdate(
            captainId,
            {
              $set: {

                // IMPORTANT:
                // Your Captain schema stores location
                // inside vehicle.location

                "vehicle.location.lat":
                  latitude,

                "vehicle.location.lng":
                  longitude,

                // Captain is currently online
                status:
                  "active",

              },
            },
            {
              new: true,
            }
          );


        // -----------------------------------------------
        // CAPTAIN NOT FOUND
        // -----------------------------------------------

        if (!updatedCaptain) {

          console.log(
            "Captain not found:",
            captainId
          );

          return;
        }


        // -----------------------------------------------
        // LOCATION DATA
        // -----------------------------------------------

        const locationData = {

          rideId,

          captainId,

          location: {
            lat:
              latitude,

            lng:
              longitude,
          },

        };


        // -----------------------------------------------
        // SEND LOCATION TO RIDE ROOM
        // -----------------------------------------------

        io.to(
          `ride-${rideId}`
        ).emit(
          "captain-location-updated",
          locationData
        );


        // -----------------------------------------------
        // LOG
        // -----------------------------------------------

        console.log(
          `Captain ${captainId} location updated:`,
          latitude,
          longitude
        );


        console.log(
          "MongoDB captain location:",
          updatedCaptain.vehicle?.location
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


        // -----------------------------------------------
        // SEND STATUS TO RIDE ROOM
        // -----------------------------------------------

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


        // -----------------------------------------------
        // SEND ETA TO RIDE ROOM
        // -----------------------------------------------

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

        // -----------------------------------------------
        // CAPTAIN OFFLINE
        // -----------------------------------------------

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


        // -----------------------------------------------
        // REMOVE USER SOCKET ID
        // -----------------------------------------------

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


        // -----------------------------------------------
        // CLEANUP COMPLETE
        // -----------------------------------------------

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