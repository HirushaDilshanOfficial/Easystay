const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const boardingRoutes = require("./Routes/BoardingRoutes");
app.use("/api/boardings", boardingRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("EasyStay Boarding List Management API is running...");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(" MongoDB Connected Successfully ✅ ");
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`   Fix: Run this command to free the port:`);
        console.error(`   lsof -ti:${PORT} | xargs kill -9`);
        console.error(`   Then run npm start again.`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });
