const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const adminAuth = require('../middleware/adminAuth');

router.get('/all', adminAuth, UserController.getAll);
router.post('/find-or-create', UserController.findOrCreate);

module.exports = router;
