const captainModel = require('../Models/Captain.model.js');
const captainService = require('../Services/captan.service.js');
const { validationResult } = require('express-validator');
const BlacklistToken = require("../Models/blacklistToken.model.js");
module.exports.registerCaptain = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            fullname: { firstname, lastname },
            email,
            password,
            vehicle: {
                color,
                plate,
                capacity,
                vehicleType
            }
        } = req.body;

        // Hash captain password
        const hashedPassword = await captainModel.hashPassword(password);

        const captain = await captainService.createCaptain({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            color,
            plate,
            capacity,
            vehicleType
        });

        return res.status(201).json({
            message: "Captain registered successfully",
            captain
        });

    } catch (error) {
        console.error(error);

        // Captain already exists
        if (error.message === "Captain already exists") {
            return res.status(409).json({
                message: error.message
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};

module.exports.loginCaptain =async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()})
    }
    const {email,password}=req.body;
    const captain=await captainModel.findOne({email}).select('+password');
    if(!captain)
    {
        return res.status(404).json({message: "Captain not found"});
    }
    const isMatch=await captain.comparePassword(password);
    if(!isMatch)
    {
        return res.status(401).json({message: "Invalid credentials"});
    }
    const token=captain.generateAuthToken();
    res.cookie('token',token);
    return res.status(200).json({ token,captain});
}



module.exports.getCaptainProfile=async(req,res,next)=>{
res.status(200).json({captain:req.captain});

}

module.exports.logoutCaptain=async(req,res,next)=>{

const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
await BlacklistToken.create({token});
res.clearCookie('token');
res.status(200).json({message:"Logged out successfully"});

}