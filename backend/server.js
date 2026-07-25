require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./db/db"); // adjust path if needed

connectDB(); // ✅ Connect before handling requests

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});