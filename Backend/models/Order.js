const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     internal_order_id: { type: String, required: true },
//     website: { type: String, required: true },
//     payment_mode: { type: String, enum: ["ONLINE", "COD"], required: true },
//     payment_status: {
//       type: String,
//       enum: ["SUCCESS", "PENDING", "FAILED","CANCELLED"],
//       default: "PENDING",
//     },
//     razorpay_order_id: { type: String },
//     razorpay_payment_id: { type: String },
//     amount: { type: Number, required: true },
//     currency: { type: String, default: "INR" },
//     customer_details: { type: Object },
//     products: { type: Array },
//   },
//   { timestamps: true }
// );

const orderSchema = new mongoose.Schema(
{
  internal_order_id: { type: String, required: true },

  website: { type: String, required: true },

  payment_mode: {
    type: String,
    enum: ["ONLINE", "COD"],
    required: true
  },

  payment_status: {
    type: String,
    enum: ["SUCCESS", "PENDING", "FAILED", "CANCELLED"],  // ✅ ADD THIS
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
      "cancelled"
    ],
    default: "pending"
  },

  razorpay_order_id: String,
  razorpay_payment_id: String,

  amount: { type: Number, required: true },

  currency: { type: String, default: "INR" },

  customer_details: Object,

  products: Array

},
{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);