const User = require('../models/user.model');

const UserController = {

  // Get all users (admin only)
  async getAll(req, res) {
    try {
      const users = await User.find().select('-__v').sort({ createdAt: -1 });
      res.json({ flag: 1, users });
    } catch (e) {
      res.json({ flag: 0, message: 'Server error' });
    }
  },

  // Get or create user by email (used during checkout)
  async findOrCreate(req, res) {
    try {
      const { name, email, phone } = req.body;
      if (!name || !email || !phone)
        return res.json({ flag: 0, message: 'Name, email and phone required' });

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name, email, phone });
      }
      res.json({ flag: 1, user });
    } catch (e) {
      res.json({ flag: 0, message: 'Server error' });
    }
  }

};

module.exports = UserController;
