const captainModel = require("../Models/captain.model.js");

module.exports.createCaptain = async ({
    firstname,
    lastname,
    email,
    password,
    color,
    plate,
    capacity,
    vehicleType
}) => {

    if (
        !firstname ||
        !email ||
        !password ||
        !color ||
        !plate ||
        !capacity ||
        !vehicleType
    ) {
        throw new Error("Please fill all the fields");
    }

    const existingCaptain = await captainModel.findOne({ email });

    if (existingCaptain) {
        console.log("captain exists");
        throw new Error("Captain already exists");
    }

    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    });

    return captain;
};