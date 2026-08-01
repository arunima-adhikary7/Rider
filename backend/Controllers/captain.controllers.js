const captainModel = require("../Models/captain.model.js");
const captainService = require("../Services/captan.service.js");
const { validationResult } = require("express-validator");
const BlacklistToken = require("../Models/blacklistToken.model.js");

// =====================================================
// COOKIE OPTIONS
// =====================================================

const isProduction =
  process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction
    ? "none"
    : "lax",

  maxAge: 24 * 60 * 60 * 1000,

  path: "/",
};


// =====================================================
// REGISTER CAPTAIN
// =====================================================

module.exports.registerCaptain = async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      fullname: {
        firstname,
        lastname,
      },
      email,
      password,
      vehicle: {
        color,
        plate,
        capacity,
        vehicleType,
      },
    } = req.body;

    // Hash password
    const hashedPassword =
      await captainModel.hashPassword(password);

    // Create captain
    const captain =
      await captainService.createCaptain({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        color,
        plate,
        capacity,
        vehicleType,
      });

    return res.status(201).json({
      message: "Captain registered successfully",
      captain,
    });

  } catch (error) {

    console.error(
      "Register Captain Error:",
      error
    );

    if (
      error.message ===
      "Captain already exists"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(400).json({
      message:
        error.message ||
        "Error registering captain",
    });
  }
};


// =====================================================
// LOGIN CAPTAIN
// =====================================================

module.exports.loginCaptain = async (
  req,
  res
) => {

  try {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      email,
      password,
    } = req.body;

    // Find captain
    const captain =
      await captainModel
        .findOne({
          email,
        })
        .select("+password");

    if (!captain) {
      return res.status(404).json({
        message: "Captain not found",
      });
    }

    // Check password
    const isMatch =
      await captain.comparePassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token =
      captain.generateAuthToken();

    // Save token in cookie
    res.cookie(
      "token",
      token,
      cookieOptions
    );

    console.log(
      "Captain login successful"
    );

    console.log(
      "Captain ID:",
      captain._id.toString()
    );

    return res.status(200).json({
      message:
        "Captain login successful",

      captain,
    });

  } catch (error) {

    console.error(
      "Captain Login Error:",
      error
    );

    return res.status(500).json({
      message:
        "Error logging in captain",
    });
  }
};


// =====================================================
// GET CAPTAIN PROFILE
// =====================================================

module.exports.getCaptainProfile = async (
  req,
  res
) => {

  try {

    if (!req.captain) {
      return res.status(401).json({
        message:
          "Captain authentication required",
      });
    }

    return res.status(200).json({
      captain: req.captain,
    });

  } catch (error) {

    console.error(
      "Get Captain Profile Error:",
      error
    );

    return res.status(500).json({
      message:
        "Error fetching captain profile",
    });
  }
};


// =====================================================
// LOGOUT CAPTAIN
// =====================================================

module.exports.logoutCaptain = async (
  req,
  res
) => {

  try {

    const token =
      req.cookies?.token ||
      req.headers.authorization
        ?.split(" ")[1];

    // If token doesn't exist,
    // still clear the cookie
    if (token) {

      await BlacklistToken.create({
        token,
      });

    }

    // IMPORTANT:
    // Same cookie options as login
    res.clearCookie(
      "token",
      cookieOptions
    );

    return res.status(200).json({
      message:
        "Logged out successfully",
    });

  } catch (error) {

    console.error(
      "Captain Logout Error:",
      error
    );

    return res.status(500).json({
      message:
        "Error logging out captain",
    });
  }
};