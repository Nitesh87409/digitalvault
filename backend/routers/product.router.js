const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);
router.post('/', adminAuth, upload.array('images', 10), ProductController.create);
router.put('/:id', adminAuth, upload.array('images', 10), ProductController.update);
router.delete('/image/:id/:index', adminAuth, ProductController.deleteImage);
router.delete('/:id', adminAuth, ProductController.remove);
router.patch('/status/:id', adminAuth, ProductController.toggleStatus);

module.exports = router;