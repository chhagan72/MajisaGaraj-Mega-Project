// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // In Percentage (e.g., 10 for 10%)
    category: { type: String, required: true, default: 'Spares' },
    stock: { type: Number, required: true, default: 0 },
    details: { type: String, required: true }, // Quick specs summary
    description: { type: String, required: true }, // Long detail description
    images: [{ type: String }], // Array of Base64 Image strings (max 5)
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            userName: { type: String, default: 'Anonymous Customer' },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

// Virtual calculation for actual sale price after applying discount matrix
ProductSchema.virtual('salePrice').get(function() {
    if (this.discount > 0) {
        return this.price - (this.price * (this.discount / 100));
    }
    return this.price;
});

ProductSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);