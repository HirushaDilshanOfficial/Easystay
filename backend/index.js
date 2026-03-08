const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { PORT } = require('./config/config');
const errorHandler = require('./utils/errorHandler');
const seedAdmin = require('./utils/adminSeeder');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

require("dotenv").config();
// Connect to database, then seed admin
connectDB().then(() => seedAdmin());

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Root route for health check
app.get('/', (req, res) => {
    res.json({ message: 'Boarding Management System API is running on port 5001' });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
