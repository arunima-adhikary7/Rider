const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const captainController = require('../Controllers/captain.controllers.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.post(
    '/register',
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),

        body("fullname.firstname")
            .notEmpty()
            .withMessage("First name is required"),

        body("vehicle.color")
            .notEmpty()
            .withMessage("Vehicle color is required"),

        body("vehicle.plate")
            .notEmpty()
            .withMessage("Vehicle plate number is required"),

        body("vehicle.capacity")
            .isInt({ min: 1 })
            .withMessage("Vehicle capacity must be a positive integer"),

        body("vehicle.vehicleType")
            .isIn(["car", "motorcycle", "auto"])
            .withMessage(
                "Vehicle type must be either car, motorcycle, or auto"
            )
    ],
    captainController.registerCaptain
);

router.post('/login',[
    body('email').isEmail().withMessage("Please enter a valid email"),
    body('password').notEmpty().withMessage("Password is required")
],
captainController.loginCaptain);

router.get('/profile',authMiddleware.authCaptain,captainController.getCaptainProfile)

router.post('/logout',authMiddleware.authCaptain,captainController.logoutCaptain);

module.exports = router;