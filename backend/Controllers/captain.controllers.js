// const captainModel = require('../Models/captain.model.js');
// const captainService = require('../Services/captan.service.js');
// const { validationResult } = require('express-validator');
// const BlacklistToken = require("../Models/blacklistToken.model.js");
// module.exports.registerCaptain = async (req, res) => {
//     try {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errors: errors.array()
//             });
//         }

//         const {
//             fullname: { firstname, lastname },
//             email,
//             password,
//             vehicle: {
//                 color,
//                 plate,
//                 capacity,
//                 vehicleType
//             }
//         } = req.body;

//         // Hash captain password
//         const hashedPassword = await captainModel.hashPassword(password);

//         const captain = await captainService.createCaptain({
//             firstname,
//             lastname,
//             email,
//             password: hashedPassword,
//             color,
//             plate,
//             capacity,
//             vehicleType
//         });

//         return res.status(201).json({
//             message: "Captain registered successfully",
//             captain
//         });

//     } catch (error) {
//         console.error(error);

//         // Captain already exists
//         if (error.message === "Captain already exists") {
//             return res.status(409).json({
//                 message: error.message
//             });
//         }

//         return res.status(400).json({
//             message: error.message
//         });
//     }
// };

// module.exports.loginCaptain =async(req,res)=>{
//     const errors=validationResult(req);
//     if(!errors.isEmpty())
//     {
//         return res.status(400).json({errors: errors.array()})
//     }
//     const {email,password}=req.body;
//     const captain=await captainModel.findOne({email}).select('+password');
//     if(!captain)
//     {
//         return res.status(404).json({message: "Captain not found"});
//     }
//     const isMatch=await captain.comparePassword(password);
//     if(!isMatch)
//     {
//         return res.status(401).json({message: "Invalid credentials"});
//     }
//     const token=captain.generateAuthToken();
//     res.cookie('token',token);
//     return res.status(200).json({ token,captain});
// }



// module.exports.getCaptainProfile=async(req,res,next)=>{
// res.status(200).json({captain:req.captain});

// }

// module.exports.logoutCaptain=async(req,res,next)=>{

// const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
// await BlacklistToken.create({token});
// res.clearCookie('token');
// res.status(200).json({message:"Logged out successfully"});

// }
const captainModel = require("../Models/captain.model.js");
const captainService = require("../Services/captan.service.js");
const { validationResult } = require("express-validator");
const BlacklistToken = require("../Models/blacklistToken.model.js");

// =====================================================
// COOKIE CONFIGURATION
// =====================================================

// Automatically detect environment
const isProduction =
    process.env.NODE_ENV === "production";

// Cookie configuration
const cookieOptions = {
    // JavaScript cannot access this cookie
    httpOnly: true,

    // Localhost:
    // secure: false
    //
    // Production:
    // secure: true
    secure: isProduction,

    // Localhost:
    // sameSite: "lax"
    //
    // Vercel + Render:
    // sameSite: "none"
    sameSite: isProduction
        ? "none"
        : "lax",

    // Cookie expires after 1 day
    maxAge: 24 * 60 * 60 * 1000,

    // Cookie available throughout application
    path: "/",
};


// =====================================================
// REGISTER CAPTAIN
// =====================================================

module.exports.registerCaptain = async (req, res) => {
    try {

        // Validate request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }


        // Get captain data
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
            await captainModel.hashPassword(
                password
            );


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


        // Return response
        return res.status(201).json({
            message:
                "Captain registered successfully",

            captain,
        });

    } catch (error) {

        console.error(
            "Register Captain Error:",
            error
        );


        // Captain already exists
        if (
            error.message ===
            "Captain already exists"
        ) {
            return res.status(409).json({
                message:
                    error.message,
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

        // Validate request
        const errors =
            validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors:
                    errors.array(),
            });
        }


        // Get login credentials
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


        // Captain not found
        if (!captain) {
            return res.status(404).json({
                message:
                    "Captain not found",
            });
        }


        // Compare password
        const isMatch =
            await captain.comparePassword(
                password
            );


        // Invalid password
        if (!isMatch) {
            return res.status(401).json({
                message:
                    "Invalid credentials",
            });
        }


        // Generate JWT
        const token =
            captain.generateAuthToken();


        // =================================================
        // SAVE TOKEN IN HTTP-ONLY COOKIE
        // =================================================

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
            captain._id
        );


        // Return response
        return res.status(200).json({
            message:
                "Captain login successful",

            captain,

            // You can keep this if your frontend
            // needs the token.
            //
            // However, authentication is handled
            // through the HTTP-only cookie.
            token,
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
    res,
    next
) => {
    try {

        return res.status(200).json({
            captain:
                req.captain,
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
    res,
    next
) => {
    try {

        // =================================================
        // GET TOKEN FROM COOKIE
        // OR AUTHORIZATION HEADER
        // =================================================

        const token =
            req.cookies?.token ||
            req.headers.authorization
                ?.split(" ")[1];


        // =================================================
        // TOKEN NOT FOUND
        // =================================================

        if (!token) {
            return res.status(401).json({
                message:
                    "Unauthorized",
            });
        }


        // =================================================
        // ADD TOKEN TO BLACKLIST
        // =================================================

        await BlacklistToken.create({
            token,
        });


        // =================================================
        // CLEAR COOKIE
        //
        // IMPORTANT:
        // Use the same cookie options
        // used when creating the cookie.
        // =================================================

        res.clearCookie(
            "token",
            cookieOptions
        );


        // =================================================
        // RESPONSE
        // =================================================

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