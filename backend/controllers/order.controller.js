const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const { sendOrderConfirmation } = require('../utils/mailer');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const OrderController = {

  // POST /order/create
  async create(req, res) {
    try {
      const { name, email, phone, product_id } = req.body;
      if (!name || !email || !phone)
        return res.json({ flag: 0, message: 'Name, email and phone required' });

      // Agar product_id aaya toh usi product ka price lo, warna pehla active product
      let product;
      if (product_id) {
        product = await Product.findById(product_id);
      } else {
        product = await Product.findOne({ status: true });
      }

      if (!product)
        return res.json({ flag: 0, message: 'Product not found' });

      const amount = product.sale_price;

      const rzpOrder = await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      });

      // product_id bhi save karo order mein
      const order = await Order.create({
        name, email, phone, amount,
        product_id: product._id,
        razorpay_order_id: rzpOrder.id,
        payment_status: 0
      });

      let user = await User.findOne({ email });
      if (!user) user = await User.create({ name, email, phone });

      res.json({
        flag: 1,
        mode: 'razorpay',
        razorpay_key: process.env.RAZORPAY_KEY_ID,
        razorpay_order_id: rzpOrder.id,
        amount: rzpOrder.amount,
        order_id: order._id
      });

    } catch (e) {
      console.error('Create order error:', e.message);
      res.json({ flag: 0, message: 'Could not create order. Try again.' });
    }
  },

  // POST /order/payment-success
  async paymentSuccess(req, res) {
    try {
      const { razorpay_response, order_id, email } = req.body;
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = razorpay_response;

      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature)
        return res.json({ flag: 0, message: 'Payment verification failed' });

      const download_token = uuidv4();
      const token_expires_at = new Date('2099-12-31'); // Lifetime access

      const order = await Order.findByIdAndUpdate(order_id, {
        payment_status: 1,
        razorpay_payment_id,
        razorpay_signature,
        download_token,
        token_expires_at
      }, { new: true });

      if (!order) return res.json({ flag: 0, message: 'Order not found' });

      try { await sendOrderConfirmation({ name: order.name, email: order.email, download_token, amount: order.amount }); } catch(e) {}
      await User.findOneAndUpdate({ email: order.email }, { $push: { orders: order._id } });

      res.json({ flag: 1, message: 'Payment verified!', download_token });
    } catch (e) {
      console.error('Payment verify error:', e.message);
      res.json({ flag: 0, message: 'Server error' });
    }
  },

  // GET /order/download/:token
  async getDownload(req, res) {
    try {
      const { token } = req.params;
      const order = await Order.findOne({ download_token: token }).populate('product_id');

      if (!order) return res.json({ flag: 0, message: 'Invalid download link' });
      if (order.payment_status !== 1) return res.json({ flag: 0, message: 'Payment not confirmed' });

      let files = [];

      // Naya order — product_id hai
      if (order.product_id) {
        const product = order.product_id;
        files = [{ id: product._id, name: product.name, url: product.file_url }];
      } else {
        // Purana order — product_id nahi tha, saare active products do
        const products = await Product.find({ status: true }).select('name file_url _id');
        files = products.map(p => ({ id: p._id, name: p.name, url: p.file_url }));
      }

      if (files.length === 0)
        return res.json({ flag: 0, message: 'No files found for this order' });

      res.json({ flag: 1, files, order_id: order._id });
    } catch (e) {
      console.error('Get download error:', e.message);
      res.json({ flag: 0, message: 'Server error' });
    }
  },

  // GET /order/file/:token/:product_id
  async serveFile(req, res) {
    try {
      const { token, product_id } = req.params;

      if (!product_id || product_id === 'undefined')
        return res.status(400).send('Invalid product. Please use the download page link.');

      const order = await Order.findOne({ download_token: token });

      if (!order || order.payment_status !== 1)
        return res.status(403).send('Access denied.');

      // product_id check — sirf usi order ka product
      if (order.product_id && order.product_id.toString() !== product_id)
        return res.status(403).send('Access denied — wrong product.');

      const product = await Product.findById(product_id);
      if (!product) return res.status(404).send('File not found.');

      const filePath = path.join(__dirname, '..', product.file_url);
      if (fs.existsSync(filePath)) {
        order.download_count = (order.download_count || 0) + 1;
        await order.save();
        return res.download(filePath);
      }

      if (product.file_url.startsWith('http')) {
        order.download_count = (order.download_count || 0) + 1;
        await order.save();
        return res.redirect(product.file_url);
      }

      res.status(404).send('File not found on server.');
    } catch (e) {
      console.error('Serve file error:', e.message);
      res.status(500).send('Server error.');
    }
  },

  // GET /order/all — admin
  async getAll(req, res) {
    try {
      const orders = await Order.find().populate('product_id', 'name').sort({ createdAt: -1 });
      const totalRevenue = orders.filter(o => o.payment_status === 1).reduce((s, o) => s + o.amount, 0);
      res.json({ flag: 1, orders, totalRevenue });
    } catch (e) {
      res.json({ flag: 0, message: 'Server error' });
    }
  },

  // GET /order/stats
  async stats(req, res) {
    try {
      const totalSales = await Order.countDocuments({ payment_status: 1 });
      res.json({ flag: 1, totalSales });
    } catch (e) {
      res.json({ flag: 0, totalSales: 0 });
    }
  },

  // POST /order/my-orders — customer apne orders dekhe email se
  async myOrders(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.json({ flag: 0, message: 'Email required' });

      const orders = await Order.find({ email, payment_status: 1 })
        .populate('product_id', 'name file_url')
        .sort({ createdAt: -1 });

      if (!orders || orders.length === 0)
        return res.json({ flag: 0, message: 'No orders found', orders: [] });

      res.json({ flag: 1, orders });
    } catch (e) {
      console.error('My orders error:', e.message);
      res.json({ flag: 0, message: 'Server error' });
    }
  }

};

module.exports = OrderController;