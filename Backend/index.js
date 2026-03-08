require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const { PORT, NODE_ENV } = require("./config/config");

const advertisementRoutes = require("./Routes/AdvertisementRoutes");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Advertisement API running..." });
});

// Routes
app.use("/api/advertisements", advertisementRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});