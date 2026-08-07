require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application');
const notificationRoutes = require('./routes/notifications');
const emailRoutes = require('./routes/email');
const contactRoutes = require('./routes/contact');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://solomon-tutoring-frontend.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ---------- FIXED START SERVER SECTION ----------
const PORT = process.env.PORT || 5000; // <--- THIS FALLBACK VALUE IS CRITICAL
app.listen(PORT, '0.0.0.0', () => {    // <--- Added '0.0.0.0' for robust local networking
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});