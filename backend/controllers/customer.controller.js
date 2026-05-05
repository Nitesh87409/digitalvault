const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const CustomerController = {

  // POST /customer/register
  async register(req, res) {
    try {
      const { name, email, phone, password } = req.body;
      if (!name || !email || !phone || !password)
        return res.json({ flag: 0, message: 'All fields required' });

      const exists = await Customer.findOne({ email });
      if (exists)
        return res.json({ flag: 0, message: 'Email already registered. Please login.' });

      const hashed = await bcrypt.hash(password, 12);
      const customer = await Customer.create({ name, email, phone, password: hashed, is_verified: true });

      const token = jwt.sign(
        { id: customer._id, email: customer.email, name: customer.name },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        flag: 1,
        message: 'Account created successfully!',
        token,
        customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone }
      });
    } catch (e) {
      console.error(e.message);
      res.json({ flag: 0, message: 'Server error' });
    }
  },

  // POST /customer/login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.json({ flag: 0, message: 'Email and password required' });

      const customer = await Customer.findOne({ email });
      if (!customer)
        return res.json({ flag: 0, message: 'No account found with this email' });

      const match = await bcrypt.compare(password, customer.password);
      if (!match)
        return res.json({ flag: 0, message: 'Incorrect password' });

      const token = jwt.sign(
        { id: customer._id, email: customer.email, name: customer.name },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        flag: 1,
        message: 'Login successful',
        token,
        customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone }
      });
    } catch (e) {
      console.error(e.message);
      res.json({ flag: 0, message: 'Server error' });
    }
  },

  // GET /customer/me — verify token
  async me(req, res) {
    try {
      const token = req.headers.authorization;
      if (!token) return res.json({ flag: 0, message: 'No token' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const customer = await Customer.findById(decoded.id).select('-password -otp -otp_expires');
      if (!customer) return res.json({ flag: 0, message: 'Customer not found' });

      res.json({ flag: 1, customer });
    } catch (e) {
      res.json({ flag: 0, message: 'Invalid token' });
    }
  }

};

module.exports = CustomerController;