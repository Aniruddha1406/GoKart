import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import { generateAndCacheSummary } from '../services/ai.service.js';

/* ─── POST /products/:id/reviews ─── Add or update a review */
export const addReview = async (req, res) => {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;
    const userId   = req.user._id;
    const username = req.user.username || req.user.email || 'Anonymous';

    if (!rating || !comment) {
        return res.status(400).json({ message: 'Rating and comment are required' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
        return res.status(404).json({ message: 'Product not found' });
    }

    try {
        // Upsert: one review per user per product
        await Review.findOneAndUpdate(
            { productId, userId },
            { rating: Number(rating), comment: comment.trim(), username },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        // Re-generate AI summary in the background (don't await — keeps response fast)
        generateAndCacheSummary(productId).catch(console.error);

        return res.status(201).json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Add review error:', error);
        return res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
};

/* ─── GET /products/:id/reviews ─── Get all reviews + cached AI summary */
export const getReviews = async (req, res) => {
    const { id: productId } = req.params;
    try {
        const [reviews, product] = await Promise.all([
            Review.find({ productId }).sort({ createdAt: -1 }),
            Product.findById(productId).select('aiSummary'),
        ]);

        const avgRating = reviews.length
            ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            : null;

        return res.status(200).json({
            reviews,
            totalReviews: reviews.length,
            avgRating: avgRating ? Number(avgRating) : null,
            aiSummary: product?.aiSummary?.text || null,
            aiSummaryGeneratedAt: product?.aiSummary?.generatedAt || null,
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

/* ─── DELETE /products/:id/reviews ─── Delete own review */
export const deleteReview = async (req, res) => {
    const { id: productId } = req.params;
    const userId = req.user._id;
    try {
        const deleted = await Review.findOneAndDelete({ productId, userId });
        if (!deleted) {
            return res.status(404).json({ message: 'Review not found' });
        }
        // Regenerate summary after deletion
        generateAndCacheSummary(productId).catch(console.error);
        return res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete review', error: error.message });
    }
};
