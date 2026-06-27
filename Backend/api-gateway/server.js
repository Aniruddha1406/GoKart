import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Health check route for AWS ALB
app.get("/", (req, res) => {
  res.status(200).send("API Gateway Healthy");
});

app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE_URL, { limit: '50mb' })
);

app.use(
  "/api/order",
  proxy(process.env.ORDER_SERVICE_URL, { limit: '50mb' })
);

app.use(
  "/api/product",
  proxy(process.env.PRODUCT_SERVICE_URL, { limit: '50mb' })
);


app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});