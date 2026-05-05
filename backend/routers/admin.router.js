const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const adminAuth = require('../middleware/adminAuth');

router.post('/login', AdminController.login);
router.patch('/password', adminAuth, AdminController.changePassword);

module.exports = router;
