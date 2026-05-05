const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const AdminController = {

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.json({ flag: 0, message: 'Email and password required' });

      const admin = await Admin.findOne({ email });
      if (!admin)
        return res.json({ flag: 0, message: 'Invalid credentials' });

      const match = await bcrypt.compare(password, admin.password);
      if (!match)
        return res.json({ flag: 0, message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: admin._id, email: admin.email, name: admin.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ flag: 1, message: 'Login successful', token, admin: { name: admin.name, email: admin.email } });
    } catch (e) {
      onsole.error("LOGIN ERROR:", e);
      res.json({ flag: 0, message: 'Server error' });
    }
    
  },

  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const admin = await Admin.findById(req.admin.id);
      const match = await bcrypt.compare(current_password, admin.password);
      if (!match) return res.json({ flag: 0, message: 'Current password incorrect' });
      admin.password = await bcrypt.hash(new_password, 12);
      await admin.save();
      res.json({ flag: 1, message: 'Password updated' });
    } catch (e) {
      res.json({ flag: 0, message: 'Server error' });
    }
  }

};

module.exports = AdminController;
