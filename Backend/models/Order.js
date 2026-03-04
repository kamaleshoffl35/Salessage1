const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    internal_order_id: { type: String, required: true },
    website: { type: String, required: true },
    payment_mode: { type: String, enum: ["ONLINE", "COD"], required: true },
    payment_status: {
      type: String,
      enum: ["SUCCESS", "PENDING", "FAILED"],
      default: "PENDING",
    },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    customer_details: { type: Object },
    products: { type: Array },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);