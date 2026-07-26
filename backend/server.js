require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./db/db");

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

  socket.on(
    "join-captain",
    async (captainId) => {
      try {
        console.log(
          `Captain ${captainId} connected with socket ${socket.id}`
        );

        // You need to update the captain's socketId
        const captainModel = require(
          "./Models/Captain.model.js"
        );

        await captainModel.findByIdAndUpdate(
          captainId,
          {
            socketId: socket.id,
            status: "active",
          }
        );
      } catch (error) {
        console.error(
          "Captain socket error:",
          error
        );
      }
    }
  );

  socket.on("disconnect", async () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );

    try {
      const captainModel = require(
        "./Models/Captain.model.js"
      );

      await captainModel.findOneAndUpdate(
        {
          socketId: socket.id,
        },
        {
          socketId: null,
          status: "inactive",
        }
      );
    } catch (error) {
      console.error(
        "Disconnect error:",
        error
      );
    }
  });
});

// =========================
// START SERVER
// =========================

server.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}`
  );
});