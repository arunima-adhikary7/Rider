const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/user.routes.js");
const captainRoutes = require("./routes/captain.routes.js");

dotenv.config();

const app = express();


// ================= CORS =================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ================= ROUTES =================
app.use("/users", userRoutes);
app.use("/captain", captainRoutes);


// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Rider Backend is running");
});


module.exports = app;