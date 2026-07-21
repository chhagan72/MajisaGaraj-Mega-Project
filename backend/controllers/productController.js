// backend/controllers/productController.js
const Product = require('../models/Product');

// 1. Create Product
exports.addProduct = async (req, res) => {
    try {
        const { title, price, discount, category, stock, details, description, images } = req.body;
        
        if (!title || !price || !category || !details || !description) {
            return res.status(400).json({ error: 'Please provide all core requested product properties.' });
        }

        const newProduct = new Product({
            title,
            price: Number(price),
            discount: Number(discount || 0),
            category,
            stock: Number(stock || 0),
            details,
            description,
            images: images || []
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product synchronized successfully inside inventory matrix.', product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Read All Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Update Product System Data
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product profile index not found in database stack.' });
        }

        res.status(200).json({ message: 'Stock adjustments updated successfully.', product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Delete Product Stack
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const targetProduct = await Product.findByIdAndDelete(id);
        
        if (!targetProduct) {
            return res.status(404).json({ error: 'Product index was already dropped or unavailable.' });
        }
        res.status(200).json({ message: 'Product profile scrubbed from active system storage boards.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Append User Review entry to a designated Product Profile
exports.addProductReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ error: 'Rating metrics and comment review are mandatory.' });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product catalog index not found.' });
        }

        // Push review payload structure inside document schema array
        product.reviews.push({
            userName: userName || 'Anonymous Customer',
            rating: Number(rating),
            comment: comment.trim()
        });

        await product.save();
        res.status(201).json({ 
            message: 'Feedback log updated successfully.', 
            reviews: product.reviews 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};