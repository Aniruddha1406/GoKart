import express from "express";
import cookieParser from "cookie-parser";
import ordersRoute from "./routes/orders.route.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", ordersRoute);

export default app;
