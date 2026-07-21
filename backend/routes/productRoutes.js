// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts, updateProduct, deleteProduct, addProductReview } = require('../controllers/productController');

router.post('/add', addProduct);
router.get('/all', getAllProducts);
router.put('/update/:id', updateProduct);
router.delete('/delete/:id', deleteProduct);
router.post('/:id/review', addProductReview);
module.exports = router;