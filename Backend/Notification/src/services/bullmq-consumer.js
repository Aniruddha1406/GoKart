import { Worker } from "bullmq";
import sendEmail from "./nodemailer.js";

const worker = new Worker(
  "email-queue", 
  async (job) => {
    console.log(`[Worker] Picked up job ${job.id} of type ${job.name}`);
    try {
      if (job.name === "notify-login") {
        const subject = "Welcome Back!";
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e0e0e0;">
            <div style="background-color: #4CAF50; padding: 30px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">Welcome Back! 🎉</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 18px; color: #333333; margin-top: 0;">Hello <strong style="color: #4CAF50;">${job.data.username || 'User'}</strong>,</p>
              <p style="font-size: 16px; color: #555555; line-height: 1.6;">We're thrilled to see you again! You've successfully logged into your account. Explore our latest products and enjoy a seamless shopping experience.</p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${process.env.FRONTEND_URL}" style="background-color: #4CAF50; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">Start Shopping</a>
              </div>
              
              <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 15px;">
                If you didn't log in recently, please secure your account. Timestamp: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `;

        await sendEmail({ to: job.data.email, subject, html });
      } else if (job.name === "notify-orderPlaced") {
        const subject = "Order Confirmation";
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e0e0e0;">
            <div style="background-color: #4CAF50; padding: 30px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">Order Confirmed! 🎉</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 18px; color: #333333; margin-top: 0;">Hello <strong style="color: #4CAF50;">${job.data.username || 'Customer'}</strong>,</p>
              <p style="font-size: 16px; color: #555555; line-height: 1.6;">Thank you for your purchase! Your order <strong>#${job.data.orderId}</strong> has been successfully placed and is now being processed.</p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${process.env.FRONTEND_URL}/profile" style="background-color: #4CAF50; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">View Order</a>
              </div>
               
              <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 15px;">
                Timestamp: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `;

        await sendEmail({ to: job.data.email, subject, html });
      } else if (job.name === "notify-updatedStatus") {
        const subject = "Order Status Update"; 
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #2196F3; text-align: center;">Order Status Update</h2>
            <p style="font-size: 16px; color: #333;">Hello <strong>${job.data.username || 'Customer'}</strong>,</p>
            <p style="font-size: 16px; color: #555;">The status of your order for <strong>${job.data.productname || 'a product'}</strong> has been updated.</p>
            <div style="background-color: #f1f1f1; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0; font-size: 15px;"><strong>New Status:</strong> <span style="color: #FF5722; font-weight: bold;">${job.data.status}</span></p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Order Placed:</strong> ${job.data.orderPlacedDate || new Date().toLocaleString()}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Updated At:</strong> ${job.data.statusUpdatedDate || new Date().toLocaleString()}</p>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        `;

        await sendEmail({ to: job.data.email, subject, html });
      } else {
        console.warn(`Unknown job name received: ${job.name}`);
      }
      return true;
    } catch (err) {
      console.error(`Error processing job ${job.id}:`, err);
      throw err; 
    }
  },
  { prefix: "{email-queue}", connection: { host: process.env.REDIS_HOST || "localhost", port: 6379, tls: process.env.REDIS_HOST && process.env.REDIS_HOST.includes("amazonaws.com") ? {} : undefined } }, 
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed: ${err}`);
});

worker.on("error", (err) => {
  console.log(`Worker error: ${err}`);
});

export default worker;