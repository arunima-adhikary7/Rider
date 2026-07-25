const userModel=require('../Models/User.model.js');
const userService=require('../services/user.service.js');
const {validationResult}=require('express-validator');
const blacklistService=require('../Models/blacklistToken.model.js');
module.exports.registerUser=async(req,res)=>{
    try{
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
const {fullname:{firstname,lastname},email,password}=req.body;
const hashedPassword=await userModel.hashPassword(password);
const user=await userService.createUser({
    firstname,
    lastname,
    email,
    password:hashedPassword
});
const token=user.generateAuthToken();
res.status(201).json({user,token});
    }
    catch(e)
    {
        console.error(e);
        res.status(400).json({
            message:"Error registering user"
        });
    }

};
module.exports.loginUser = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { email, password } = req.body;

    try {
        const user = await userModel
            .findOne({ email })
            .select('+password');

        // Email does not exist
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Password is incorrect
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }
        
       

        // Login successful
        const token = user.generateAuthToken();
         res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            maxAge:24*60*60*1000
        })

        return res.status(200).json({
            user,
            token
        });

    } catch (e) {
        console.error(e);

        return res.status(500).json({
            message: "Error logging in user"
        });
    }
};

module.exports.getUserProfile = async(req,res,next)=>{

res.status(200).json(req.user);
}

const BlacklistToken = require('../Models/blacklistToken.model.js');

module.exports.logoutUser = async (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Add token to blacklist
        await BlacklistToken.create({
            token
        });

        // Clear cookie
        res.clearCookie("token");

        return res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Error logging out"
        });
    }
};