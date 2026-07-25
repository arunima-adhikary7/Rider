const userModel = require("../Models/User.model.js");

module.exports.createUser = async ({
    firstname,
    lastname,
    email,
    password
}) => {

    if (!firstname || !email || !password) {
        throw new Error("Please fill all the fields");
    }
    const existingUser=await userModel.findOne({email});
    if(existingUser)
    {
        console.log("user exists");
        throw new Error("User already exists");
    }

    const user = await userModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password
    });

    return user;
};