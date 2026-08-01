const userModel = require("../Models/User.model.js");
const BlacklistToken = require("../Models/blacklistToken.model.js");
const jwt = require("jsonwebtoken");
const captainModel = require("../Models/captain.model.js");

module.exports.authUser = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Check if token is blacklisted
        const isBlacklisted = await BlacklistToken.findOne({
            token
        });

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // Attach user to request
        req.user = user;

        next();

    } catch (error) {
        console.error(error);

        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};



module.exports.authCaptain = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Check if token is blacklisted
        const isBlacklisted = await BlacklistToken.findOne({
            token
        });

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Token is blacklisted"
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find captain using ID from JWT
        const captain = await captainModel.findById(
            decoded._id
        );

        // Captain does not exist
        if (!captain) {
            return res.status(401).json({
                message: "Captain not found"
            });
        }

        // Attach captain to request
        req.captain = captain;

        // Continue to next middleware/controller
        next();

    } catch (error) {
        console.error(error);

        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};