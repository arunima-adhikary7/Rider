const mongoose = require("mongoose");

function connectDB() {
    mongoose.connect(process.env.DB_CONNECT)
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
        });
}

module.exports = connectDB;