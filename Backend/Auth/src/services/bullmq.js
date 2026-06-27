
import usermodel from "../models/user.model.js";
import { Queue } from "bullmq"

const emailQueue = new Queue("email-queue", {
  prefix: "{email-queue}",
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: 6379,
    tls: process.env.REDIS_HOST && process.env.REDIS_HOST.includes("amazonaws.com") ? {} : undefined,
  },
});

export async function notifyLogin(username, email) {
  await emailQueue.add("notify-login", {
    username,
    email,
  });
  console.log("Job added successfully", {username, email})
}
