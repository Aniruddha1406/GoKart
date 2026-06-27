import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        prodId:    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
        prodName:  { type: String },
        prodImage: { type: String },
        price:     { type: Number, required: true },
        quantity:  { type: Number, required: true }
    }]
});

const Cart = mongoose.model('Cart', cartSchema);
const cartmodel = {Cart};
export default cartmodel;