const mongoose = require("mongoose");

function connectDB() {
    mongoose.connect(process.env.DB_CONNECT)
        .then(() => {
            console.log("MongoDB connected");
               console.log(
            "Connected Database:",
            mongoose.connection.name
        );
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
        });
}

module.exports = connectDB;