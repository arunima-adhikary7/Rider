require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./db/db");

const captainModel = require("./Models/Captain.model.js");
const userModel = require("./Models/user.model.js");

connectDB();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// =========================
// SOCKET.IO
// =========================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Make io available inside controllers
app.set("io", io);

// =========================
// SOCKET CONNECTION
// =========================

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );


  // =========================
  // CAPTAIN JOINS
  // =========================

  socket.on(
    "join-captain",
    async (captainId) => {
      try {
        console.log(
          `Captain ${captainId} connected with socket ${socket.id}`
        );

        await captainModel.findByIdAndUpdate(
          captainId,
          {
            socketId: socket.id,
            status: "active",
          }
        );

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


  // =========================
  // USER JOINS
  // =========================

  socket.on(
    "join-user",
    async (userId) => {
      try {
        console.log(
          `User ${userId} connected with socket ${socket.id}`
        );

        await userModel.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
          }
        );

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


  // =========================
  // DISCONNECT
  // =========================

  socket.on(
    "disconnect",
    async () => {

      console.log(
        "Socket disconnected:",
        socket.id
      );

      try {

        // =========================
        // CAPTAIN OFFLINE
        // =========================

        await captainModel.findOneAndUpdate(
          {
            socketId: socket.id,
          },
          {
            socketId: null,
            status: "inactive",
          }
        );


        // =========================
        // USER SOCKET REMOVED
        // =========================

        await userModel.findOneAndUpdate(
          {
            socketId: socket.id,
          },
          {
            socketId: null,
          }
        );


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


// =========================
// START SERVER
// =========================

server.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}`
  );
});