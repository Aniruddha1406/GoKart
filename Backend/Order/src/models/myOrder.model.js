import mongoose from "mongoose";

// create a new schema for MyOrder where a seller will be able to see all the orders placed for their products 

const myOrderSchema = new mongoose.Schema({
    sellerId: { type: String, required: true },
    items: [{
        prodId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
        orderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Order" },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"}
    }],
    createdAt: { type: Date, default: Date.now }
}); 

const MyOrder = mongoose.model("MyOrder", myOrderSchema);
export default MyOrder;