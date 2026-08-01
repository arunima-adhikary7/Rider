const userModel = require("../Models/User.model.js");
const userService = require("../Services/user.service.js");
const { validationResult } = require("express-validator");
const BlacklistToken = require("../Models/blacklistToken.model.js");

// =====================================================
// REGISTER USER
// =====================================================

module.exports.registerUser = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        // Get user data
        const {
            fullname: {
                firstname,
                lastname,
            },
            email,
            password,
        } = req.body;

        // Hash password
        const hashedPassword =
            await userModel.hashPassword(password);

        // Create user
        const user = await userService.createUser({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });

        // Generate JWT
        const token =
            user.generateAuthToken();

        // Save JWT in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,

            // HTTPS required in production
            secure:
                process.env.NODE_ENV === "production",

            // Required for Vercel -> Render cross-site cookies
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            // Cookie expires after 1 day
            maxAge:
                24 * 60 * 60 * 1000,

            // Cookie available throughout the application
            path: "/",
        });

        // Return response
        return res.status(201).json({
            message: "User registered successfully",
            user,
            token,
        });

    } catch (error) {
        console.error(
            "Register User Error:",
            error
        );

        return res.status(400).json({
            message: "Error registering user",
        });
    }
};


// =====================================================
// LOGIN USER
// =====================================================

module.exports.loginUser = async (req, res) => {
    try {
        // Validate request
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

        // Find user
        const user =
            await userModel
                .findOne({ email })
                .select("+password");

        // User does not exist
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Compare password
        const isMatch =
            await user.comparePassword(
                password
            );

        // Incorrect password
        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }

        // Generate JWT
        const token =
            user.generateAuthToken();

        // Save JWT in cookie
        res.cookie("token", token, {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            maxAge:
                24 * 60 * 60 * 1000,

            path: "/",
        });

        // Send response
        return res.status(200).json({
            message: "Login successful",
            user,
            token,
        });

    } catch (error) {
        console.error(
            "Login User Error:",
            error
        );

        return res.status(500).json({
            message: "Error logging in user",
        });
    }
};


// =====================================================
// GET USER PROFILE
// =====================================================

module.exports.getUserProfile = async (
    req,
    res
) => {
    try {
        return res.status(200).json({
            user: req.user,
        });

    } catch (error) {
        console.error(
            "Get User Profile Error:",
            error
        );

        return res.status(500).json({
            message:
                "Error fetching user profile",
        });
    }
};


// =====================================================
// LOGOUT USER
// =====================================================

module.exports.logoutUser = async (
    req,
    res
) => {
    try {
        // Get token from cookie
        // OR Authorization header
        const token =
            req.cookies?.token ||
            req.headers.authorization
                ?.split(" ")[1];

        // No token
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        // Add token to blacklist
        await BlacklistToken.create({
            token,
        });

        // Clear cookie
        res.clearCookie("token", {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            path: "/",
        });

        return res.status(200).json({
            message:
                "Logged out successfully",
        });

    } catch (error) {
        console.error(
            "Logout User Error:",
            error
        );

        return res.status(500).json({
            message:
                "Error logging out",
        });
    }
};