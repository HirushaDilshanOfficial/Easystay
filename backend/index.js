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
const contactRoutes = require('./routes/contactRoutes');
const boardingRoutes = require('./routes/BoardingRoutes');
const appointmentRoutes = require('./routes/AppointmentRoutes');
const tenancyRoutes = require('./routes/TenancyRoutes');
const paymentRoutes = require('./routes/PaymentRoutes');
const advertisementRoutes = require('./routes/AdvertisementRoutes');
const reviewRoutes = require('./routes/ReviewRoutes');
const reportRoutes = require('./routes/ReportRoutes');

// Connect to database, then seed admin
connectDB().then(() => seedAdmin());

const app = express();

// Enable CORS - allow all origins with credentials
app.use(cors({
    origin: true,
    credentials: true
}));

// Body parser with increased limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root route for health check
app.get('/', (req, res) => {
    res.json({ message: 'Boarding Management System API is running on port 5001' });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/boardings', boardingRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tenancy', tenancyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);

// Error handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
