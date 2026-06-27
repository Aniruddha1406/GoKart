import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        prodId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        productName: { type: String },
        productPrice: { type: Number },
        productImage: { type: String },
        quantity: { type: Number, required: true },
        status: {
          type: String,
          enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
          default: "Pending",
        },
      },
    ],
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Online", "COD"], default: "Online" },
    paymentId: { type: String, unique: true, sparse: true, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
