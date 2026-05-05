const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const adminAuth = require('../middleware/adminAuth');

router.get('/stats', OrderController.stats);
router.get('/all', adminAuth, OrderController.getAll);
router.get('/download/:token', OrderController.getDownload);
router.get('/file/:token/:product_id', OrderController.serveFile);
router.post('/create', OrderController.create);
router.post('/payment-success', OrderController.paymentSuccess);
router.post('/my-orders', OrderController.myOrders);

module.exports = router;