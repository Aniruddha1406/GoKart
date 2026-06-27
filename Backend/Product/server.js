import 'dotenv/config';
import app from "./src/app.js";
import connectDB from "./config/db.js";

connectDB();

app.listen(3002, () => {
  console.log("Product service is running on port 3002");
});
