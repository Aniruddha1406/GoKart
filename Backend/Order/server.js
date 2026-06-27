import dotenv from "dotenv";
dotenv.config("./.env");
import app from "./src/app.js";
import connectDB from "./config/db.js";

connectDB();


app.listen(3003, () => {
  console.log("Product service is running on port 3003");
});
