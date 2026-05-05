const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.json({ flag: 0, message: 'Access token missing' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (e) {
    return res.json({ flag: 0, message: 'Invalid or expired token' });
  }
};

module.exports = adminAuth;
