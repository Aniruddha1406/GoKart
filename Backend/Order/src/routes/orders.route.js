import express from "express";
import { getMyOrder, getMyOrderById, initializePayment, confirmPaymentAndCreateOrder, MyOrders, getCartItems, addToCart, removeFromCart, updateOrderStatus, totalCartPrice } from "../controller/order.controller.js";
import { customer_authenticate } from "../middleware/customer.auth.middleware.js";
import { seller_authenticate } from "../middleware/seller.auth.middleware.js";

const router = express.Router();

// Initialize payment (creates Razorpay order only)
router.post("/initialize-payment", customer_authenticate, initializePayment);

// Confirm payment and create order
//notify for payment success or failure
router.post("/confirm-payment", customer_authenticate, confirmPaymentAndCreateOrder); 

// Get all items in a user's cart
router.get("/cart", customer_authenticate, getCartItems);

// Add an item to a user's cart
router.post("/cart", customer_authenticate, addToCart);

// Remove an item from a user's cart
router.delete("/cart/:id", customer_authenticate, removeFromCart);
 
//total price of cart
router.get("/cart/total", customer_authenticate, totalCartPrice);

//get all orders of a seller
router.get("/seller/orders", seller_authenticate, MyOrders);

//update order status by seller
router.put("/seller/orders/:orderId/:prodId/status", seller_authenticate, updateOrderStatus);

//get all orders of a customer
router.get("/customer/orders",customer_authenticate,getMyOrder)

//get a specific order of a customer
router.get("/customer/orders/:orderId",customer_authenticate,getMyOrderById)

//notify the updated status of order to customer 
// to be done

export default router;
