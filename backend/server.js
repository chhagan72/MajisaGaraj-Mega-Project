// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = async () => {
    const mongoose = require('mongoose');
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected for Majisa Garage: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
};

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const app = express();

// Initialize Database Connection
connectDB();

// Global Middleware Setups
app.use(cors());

// ============================================================
// CRITICAL SOLUTION: EXPAND LIMIT CONFIGURATIONS BEFORE ROUTERS
// ============================================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Modular API Base Endpoint Routing
app.use('/api/auth', authRoutes);
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server executing securely on port ${PORT}`));

// OLD

// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const connectDB = async () => {
//     const mongoose = require('mongoose');
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);
//         console.log(`MongoDB Connected for Majisa Garage: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Database connection failed: ${error.message}`);
//         process.exit(1);
//     }
// };

// const authRoutes = require('./routes/authRoutes');
// const productRoutes = require('./routes/productRoutes');
// const app = express();

// // Initialize Database Connection
// connectDB();

// // Global Middleware Setups
// app.use(express.json());
// app.use(cors());

// // ==========================================
// // CRITICAL FIX: EXPAND PAYLOAD SIZE LIMITS FOR BASE64 IMAGES
// // ==========================================
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // Modular API Base Endpoint Routing
// app.use('/api/auth', authRoutes);
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/auth', require('./routes/ticketRoutes'));
// app.use('/api/services', require('./routes/serviceRoutes'));
// app.use('/api/products', productRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server executing securely on port ${PORT}`));