const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer.controller');

router.post('/register', CustomerController.register);
router.post('/login', CustomerController.login);
router.get('/me', CustomerController.me);

module.exports = router;