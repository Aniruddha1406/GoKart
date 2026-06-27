import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "seller"], default: "customer" },
  },
  { timestamps: true },
);

userSchema.index({ email: 1, role: 1 }, { unique: true });

const Customer = mongoose.model("User", userSchema);

export default Customer;
