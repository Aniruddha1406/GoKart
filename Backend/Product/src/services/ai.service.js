import { GoogleGenerativeAI } from '@google/generative-ai';
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates an AI summary from all reviews of a product and caches it in the Product doc.
 */
export async function generateAndCacheSummary(productId) {
    const reviews = await Review.find({ productId });
    if (reviews.length === 0) return;

    const reviewTexts = reviews
        .map(r => `Rating: ${r.rating}/5 — "${r.comment}"`)
        .join('\n');

    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

    const prompt = `You are a helpful product review analyst. Below are customer reviews for an e-commerce product.

Reviews:
${reviewTexts}

Average rating: ${avgRating}/5 (${reviews.length} reviews)

Write a concise 2-3 sentence summary of the overall customer sentiment. Mention the main pros and, if any, the main cons. Keep it factual and friendly. Do not start with "Summary:" or any label.`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const summaryText = result.response.text().trim();

        await Product.findByIdAndUpdate(productId, {
            aiSummary: {
                text:        summaryText,
                generatedAt: new Date(),
                reviewCount: reviews.length,
            }
        });

        return summaryText;
    } catch (error) {
        console.error('Gemini AI summary generation failed:', error.message);
        return null;
    }
}
