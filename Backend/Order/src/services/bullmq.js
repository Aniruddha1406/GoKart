// producer.js
import ordermodel from "../models/order.model.js";
import usermodel from "../models/user.model.js";
import productmodel from "../models/product.model.js";
import { Queue } from "bullmq"

const emailQueue = new Queue("email-queue", {
  prefix: "{email-queue}",
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: 6379,
    tls: process.env.REDIS_HOST && process.env.REDIS_HOST.includes("amazonaws.com") ? {} : undefined,
  },
});

export async function notifyOrderPlaced(order) {
  const neworder = await ordermodel.findById(order._id);
  const user = await usermodel.findById(neworder.userId);
  const username = user.username;
  const email = user.email;
  await emailQueue.add("notify-orderPlaced", {
    username,
    email,
    orderId:order._id
  });
  console.log("Job added successfully", {username, email})
}

export async function notifyUpdatedStatus(prodId, userId, status) {
  console.log(prodId,userId,status)
  const product = await productmodel.findById(prodId);
  const user = await usermodel.findById(userId);
  const username = user.username;
  const email = user.email;
  const productname = product.name;
  await emailQueue.add("notify-updatedStatus", {
    username,
    email,
    productname,
    status
  });
  console.log("Job added successfully", {username, email, productname})
}
