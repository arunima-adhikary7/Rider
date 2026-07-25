const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../Controllers/user.Controllers");
const authMiddleware = require("../middleware/auth.middleware");
router.post(
    "/register",
    [
        body("email").isEmail().withMessage("Please enter a valid email"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("fullname.firstname")
            .notEmpty()
            .withMessage("First name is required"),
    ],
    userController.registerUser
);
router.post('/login',[
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long')
],userController.loginUser)

router.get('/profile',authMiddleware.authUser,userController.getUserProfile);

router.get('/logout',authMiddleware.authUser,userController.logoutUser);

module.exports = router;