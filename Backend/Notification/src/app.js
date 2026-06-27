import express from "express";
import worker from "./services/bullmq-consumer.js";
import sendemail from "./services/nodemailer.js"
const app = express();
app.use(express.json());

// Worker automatically starts when imported
console.log("BullMQ worker started"); 

export default app;
        