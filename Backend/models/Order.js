const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    internal_order_id: { type: String, required: true },
    website: { type: String, required: true },
    payment_mode: {
      type: String,
      enum: ["ONLINE", "COD","BANK"],
      required: true,
    },
    payment_proof: String,
    payment_status: {
      type: String,
      enum: ["SUCCESS", "PENDING", "FAILED", "CANCELLED","PENDING_VERIFICATION"], 
      default: "PENDING",
    },
    order_status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "confirmed",
    },
    razorpay_order_id: String,
    razorpay_payment_id: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    customer_details: Object,
    products: Array,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
