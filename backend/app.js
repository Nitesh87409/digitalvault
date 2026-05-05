require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded products)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digitalvault')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// Routes
app.use('/admin', require('./routers/admin.router'));
app.use('/customer', require('./routers/customer.router'));
app.use('/user', require('./routers/user.router'));
app.use('/product', require('./routers/product.router'));
app.use('/order', require('./routers/order.router'));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check
// app.get('/', (req, res) => res.json({ status: 'DigitalVault API running ✅', version: '1.0.0' }));

// Create first admin on startup (runs only if no admin exists)
const { createFirstAdmin } = require('./utils/setup');
mongoose.connection.once('open', createFirstAdmin);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));