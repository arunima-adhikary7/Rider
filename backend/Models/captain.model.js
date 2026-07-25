const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, "First name must be at least 3 characters long"]
        },
        lastname: {
            type: String,
            required: true,
            minlength: [3, "Last name must be at least 3 characters long"]
        }
    },

    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            "Please enter a valid email"
        ]
    },

    password: {
        type: String,
        required: true,
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    },

    socketId: {
        type: String
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },

    vehicle: {
        color: {
            type: String,
            required: true,
            minlength: [
                3,
                "Vehicle color must be at least 3 characters long"
            ]
        },

        price: {
            type: Number,
            // required: true,
            min: [
                3,
                "Vehicle price must be a positive number"
            ]
        },

        capacity: {
            type: Number,
            required: true,
            min: [
                1,
                "Vehicle capacity must be a positive number"
            ]
        },

        vehicleType: {
            type: String,
            required: true,
            enum: ['car', 'motorcycle', 'auto']
        },

        location: {
            lat: {
                type: Number
            },
            long: {
                type: Number
            }
        }
    }
});


// Generate JWT
captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
            _id: this._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );

    return token;
};


// Compare password during login
captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


// Hash password during registration
captainSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 12);
};


const captainModel = mongoose.model('captain', captainSchema);

module.exports = captainModel;