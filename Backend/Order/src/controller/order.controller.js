import mongoose from "mongoose";
import ordermodel from "../models/order.model.js";
import { createOrder as createRazorpayOrder } from "../services/razorpay.js";
import cartmodel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import myordermodel from "../models/myOrder.model.js";
import {notifyOrderPlaced,notifyUpdatedStatus} from "../services/bullmq.js";

export const initializePayment = async (req, res) => {
  try {
    const { totalPrice } = req.body;

    if (!totalPrice) {
      return res.status(400).json({ message: "totalPrice is required" });
    }

    const razorpayOrder = await createRazorpayOrder(
      Math.round(totalPrice * 100),
      "INR",
      `order_${Date.now()}`,
    );

    return res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to initialize payment", error: error.message });
  }
};

export const confirmPaymentAndCreateOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, totalPrice, address, razorpayPaymentId, buyNow, paymentMethod = "Online" } = req.body;
    if (!items || !totalPrice || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    let finalPaymentId = razorpayPaymentId;
    if (paymentMethod === "COD") {
      finalPaymentId = `COD_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    } else if (!razorpayPaymentId) {
      return res.status(400).json({ message: "Missing razorpayPaymentId for online payment" });
    }

    // Enrich items with product snapshot before saving
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await productModel.findOne({ _id: item.prodId, isDeleted: false });
        return {
          ...item,
          productName:  product?.name  ?? null,
          productPrice: product?.price ?? null,
          productImage: product?.images ?? null,
        };
      })
    );

    // Create order in DB with Completed status
    const order = new ordermodel({
      userId,
      items: enrichedItems,
      totalPrice,
      paymentId: finalPaymentId,
      paymentMethod,
      address,
    });
    await order.save();

    console.log("Order saved with ID:", order._id);

    // Create seller orders for each product
    for (const item of order.items) {
      const product = await productModel.findOne({ _id: item.prodId, isDeleted: false });
      if (!product) {
        continue;
      }

      const sellerId = product.seller?.toString();
      const price = product.price;
      const mymyorder = await myordermodel.findOne({ sellerId });
      let myOrder = mymyorder;
      if (!mymyorder) {
        myOrder = new myordermodel({
          sellerId,
          items: [],
        });
      }
      console.log("Pushing to myOrder with orderId:", order._id);
      myOrder.items.push({
        prodId: item.prodId,
        orderId: order._id,
        price,
        quantity: item.quantity,
        status: "Pending",
      });
      await myOrder.save();
    }
    
    // Clear the cart after any order (including Buy Now)
    await cartmodel.Cart.findOneAndUpdate({ userId }, { items: [] });
    
    notifyOrderPlaced(order);
    return res.status(201).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
};

// Get all items in a user's cart
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await cartmodel.Cart.findOne({ userId });
    res.status(200).json(cart ? cart.items : []);
  } catch (error) {
    res.status(500).json({ message: "Failed to get cart items", error });
  }
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  try {
    let product = await productModel.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let cart = await cartmodel.Cart.findOne({ userId });
    if (!cart) {
      cart = new cartmodel.Cart({ userId, items: [] });
    }
    const ind = cart.items.findIndex(
      (item) => item.prodId.toString() === productId,
    );
    if (ind !== -1) {
      cart.items[ind].quantity += parseInt(quantity);
      if (cart.items[ind].quantity <= 0) {
        cart.items.splice(ind, 1);
      }
    } else {
      cart.items.push({
        prodId:    productId,
        prodName:  product.name,
        prodImage: product.images ?? null,
        price:     product.price,
        quantity:  parseInt(quantity),
      });
    }
    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add item to cart", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const cart = await cartmodel.Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.prodId.toString() === id,
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    cart.items.splice(itemIndex, 1);
    await cart.save();
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item from cart", error });
  }
};

export const totalCartPrice = async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await cartmodel.Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    res.status(200).json({ total });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to calculate total cart price", error });
  }
};

export const MyOrders = async (req, res) => {
  try {
    const sellerId = req.user._id.toString();
    const myOrderDoc = await myordermodel.findOne({ sellerId });
    if (!myOrderDoc) return res.status(200).json([]);

    // Enrich each item with product info and shipping address
    const enrichedItems = await Promise.all(
      myOrderDoc.items.map(async (item) => {
        const product = await productModel.findById(item.prodId).select("name images price");
        const parentOrder = await ordermodel.findById(item.orderId).select("address createdAt");
        return {
          _id: item._id,
          prodId: item.prodId,
          orderId: item.orderId,
          price: item.price,
          quantity: item.quantity,
          status: item.status,
          productName: product?.name ?? "Unknown Product",
          productImage: product?.images ?? null,
          address: parentOrder?.address ?? null,
          orderedAt: parentOrder?.createdAt ?? null,
        };
      })
    );

    res.status(200).json(enrichedItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to get orders", error });
  }
};

export const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, prodId } = req.params;
    const { status } = req.body;
    const sellerId = req.user._id;

    const order = await ordermodel.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }
    const itemInOrder = order.items.find(
      (item) => item.prodId.toString() === prodId,
    );
    if (!itemInOrder) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Item not found in order" });
    }
    if(itemInOrder.status === status){
      return res.status(400).json({message:"Same status"})
    }
    itemInOrder.status = status;
    await order.save({ session });

    const myOrder = await myordermodel
      .findOne({
        sellerId,
        "items.orderId": orderId,
        "items.prodId": prodId,
      })
      .session(session);

    if (!myOrder) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    const item = myOrder.items.find(
      (item) =>
        item.orderId.toString() === orderId &&
        item.prodId.toString() === prodId,
    );
    if (!item) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Item not found in order" });
    }

    item.status = status;
    await myOrder.save({ session });
    notifyUpdatedStatus(prodId, order.userId, status);
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Order status updated", myOrder });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Failed to update order status", error: error.message });
  }
};


export const getMyOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await ordermodel
      .find({ userId })
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to get orders", error });
  }
};

export const getMyOrderById = async(req,res) => {
  try {
    const userId = req.user._id;
    const {orderId} = req.params;
    const order = await ordermodel.findOne({userId, _id: orderId}).populate("items.prodId","name image price category");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to get order", error });
  }
};