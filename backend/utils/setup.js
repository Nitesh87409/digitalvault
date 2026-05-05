const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.model');

async function createFirstAdmin() {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
      await Admin.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@digitalvault.in',
        password: hashed
      });
      console.log('✅ First admin created:', process.env.ADMIN_EMAIL);
    }
  } catch (e) {
    console.error('❌ Admin setup error:', e.message);
  }
}

module.exports = { createFirstAdmin };
