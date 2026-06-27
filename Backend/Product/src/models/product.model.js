import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, enum: ['Tech', 'Food', 'Clothing'], required: true },
    images: { type: String, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
    aiSummary: {
        text:        { type: String, default: null },
        generatedAt: { type: Date,   default: null },
        reviewCount: { type: Number, default: 0    }
    }
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema);
export default Product;