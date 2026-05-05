const Product = require('../models/product.model');
const fs = require('fs');
const path = require('path');

const ProductController = {

  async getAll(req, res) {
    try {
      const products = await Product.find({ status: true }).sort({ createdAt: -1 });
      res.json({ flag: 1, products });
    } catch (e) { res.json({ flag: 0, message: 'Server error' }); }
  },

  async getOne(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.json({ flag: 0, message: 'Product not found' });
      res.json({ flag: 1, product });
    } catch (e) { res.json({ flag: 0, message: 'Server error' }); }
  },

  async create(req, res) {
    try {
      const { name, description, original_price, sale_price, file_url } = req.body;
      if (!name || !original_price || !sale_price || !file_url)
        return res.json({ flag: 0, message: 'All fields required' });
      const images = (req.files || []).map(f => '/uploads/products/' + f.filename);
      const product = await Product.create({ name, description, images, original_price, sale_price, file_url });
      res.json({ flag: 1, message: 'Product created', product });
    } catch (e) { console.error(e.message); res.json({ flag: 0, message: 'Server error' }); }
  },

  async update(req, res) {
    try {
      const { name, description, original_price, sale_price, file_url, existing_images } = req.body;
      let images = existing_images ? (Array.isArray(existing_images) ? existing_images : [existing_images]) : [];
      if (req.files && req.files.length > 0) {
        images = [...images, ...req.files.map(f => '/uploads/products/' + f.filename)];
      }
      images = images.slice(0, 10);
      const product = await Product.findByIdAndUpdate(req.params.id, { name, description, images, original_price, sale_price, file_url }, { new: true });
      if (!product) return res.json({ flag: 0, message: 'Product not found' });
      res.json({ flag: 1, message: 'Product updated', product });
    } catch (e) { console.error(e.message); res.json({ flag: 0, message: 'Server error' }); }
  },

  async remove(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.json({ flag: 0, message: 'Product not found' });
      product.images.forEach(imgPath => {
        const full = path.join(__dirname, '..', imgPath);
        if (fs.existsSync(full)) fs.unlinkSync(full);
      });
      await Product.findByIdAndDelete(req.params.id);
      res.json({ flag: 1, message: 'Product deleted' });
    } catch (e) { res.json({ flag: 0, message: 'Server error' }); }
  },

  async deleteImage(req, res) {
    try {
      const { id, index } = req.params;
      const product = await Product.findById(id);
      if (!product) return res.json({ flag: 0, message: 'Product not found' });
      const imgPath = product.images[index];
      if (imgPath) {
        const full = path.join(__dirname, '..', imgPath);
        if (fs.existsSync(full)) fs.unlinkSync(full);
        product.images.splice(index, 1);
        await product.save();
      }
      res.json({ flag: 1, message: 'Image deleted', images: product.images });
    } catch (e) { res.json({ flag: 0, message: 'Server error' }); }
  },

  async toggleStatus(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.json({ flag: 0, message: 'Product not found' });
      product.status = !product.status;
      await product.save();
      res.json({ flag: 1, message: 'Status updated', status: product.status });
    } catch (e) { res.json({ flag: 0, message: 'Server error' }); }
  }
};

module.exports = ProductController;