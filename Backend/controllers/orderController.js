// const razorpay = require("../config/razorpay");
// const Order = require("../models/Order");
// const crypto = require("crypto");

// exports.createOrder = async (req, res) => {
//   try {
//     const { amount, currency, customer_details, products } = req.body;

// const website = req.user.tenant; // 🔥 get from JWT middleware

// if (!website) {
//   return res.status(403).json({ error: "Invalid tenant" });
// }

//     const options = {
//       amount: amount * 100,
//       currency: currency || "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     res.json({
//       razorpay_order_id: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       key: process.env.RAZORPAY_KEY_ID,
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       website,
//       amount,
//       customer_details,
//       products,
//     } = req.body;

//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ error: "Payment verification failed" });
//     }

//     const orderCount = await Order.countDocuments({ website });

//     const internalId = `CHAKRA-2026-${String(orderCount + 1).padStart(4, "0")}`;

//     const newOrder = await Order.create({
//       internal_order_id: internalId,
//       website,
//       payment_mode: "ONLINE",
//       payment_status: "SUCCESS",
//       razorpay_order_id,
//       razorpay_payment_id,
//       amount,
//       customer_details,
//       products,
//     });

//     res.json({ order_id: internalId });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.createCodOrder = async (req, res) => {
//   try {
//     const { website, amount, customer_details, products } = req.body;

//     const orderCount = await Order.countDocuments({ website });

//     const internalId = `CHAKRA-2026-${String(orderCount + 1).padStart(4, "0")}`;

//     await Order.create({
//       internal_order_id: internalId,
//       website,
//       payment_mode: "COD",
//       payment_status: "PENDING",
//       amount,
//       customer_details,
//       products,
//     });

//     res.json({ order_id: internalId });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const crypto = require("crypto");

/* ============================
   CREATE ONLINE ORDER
============================ */
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, customer_details, products } = req.body;

    // ✅ Get tenant from JWT middleware (secure)
    const website = req.user?.tenant;

    if (!website) {
      return res.status(403).json({ error: "Invalid tenant" });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID, // ✅ Send only KEY_ID
    });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};


/* ============================
   VERIFY ONLINE PAYMENT
============================ */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      customer_details,
      products,
    } = req.body;

    // ✅ Always take website from JWT (not from frontend)
    const website = req.user?.tenant;

    if (!website) {
      return res.status(403).json({ error: "Invalid tenant" });
    }

    // ✅ Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Generate internal order ID
    const orderCount = await Order.countDocuments({ website });
    const internalId = `CHAKRA-2026-${String(orderCount + 1).padStart(4, "0")}`;

    await Order.create({
      internal_order_id: internalId,
      website,
      payment_mode: "ONLINE",
      payment_status: "SUCCESS",
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      customer_details,
      products,
    });

    return res.json({ order_id: internalId });

  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
};


/* ============================
   CREATE COD ORDER
============================ */
exports.createCodOrder = async (req, res) => {
  try {
    const { amount, customer_details, products } = req.body;

    const website = req.user?.tenant;

    if (!website) {
      return res.status(403).json({ error: "Invalid tenant" });
    }

    const orderCount = await Order.countDocuments({ website });
    const internalId = `CHAKRA-2026-${String(orderCount + 1).padStart(4, "0")}`;

    await Order.create({
      internal_order_id: internalId,
      website,
      payment_mode: "COD",
      payment_status: "PENDING",
      amount,
      customer_details,
      products,
    });

    return res.json({ order_id: internalId });

  } catch (err) {
    console.error("COD Order Error:", err);
    res.status(500).json({ error: "Failed to create COD order" });
  }
};

// exports.cancelOrder = async (req, res) => {
//   try {
//     const orderId = req.params.id;

//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.order_status === "cancelled") {
//       return res.status(400).json({ message: "Order already cancelled" });
//     }

//     order.order_status = "cancelled";
//     order.payment_status = "CANCELLED";

//     await order.save();

//     const SalesReturn = require("../models/SalesReturn");

//     const items = order.products.map((p) => ({
//       product_id: p.product_id,
//       product_name: p.productDetails?.title,
//       quantity: p.qty,
//       return_amount: p.price * p.qty,
//     }));

//     const salesReturn = new SalesReturn({
//       invoice_no: order._id,
//       invoice_number: order.internal_order_id,
//       invoice_date_time: order.createdAt,
//       customer_name: order.customer_details.fullName,
//       customer_phone: order.customer_details.phone,
//       items,
//       reason: "Order Cancelled by Customer",
//     });

//     await salesReturn.save();

//     res.json({
//       message: "Order cancelled successfully",
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Cancel failed" });
//   }
// };

// exports.cancelOrder = async (req, res) => {
//   try {
//     const orderId = req.params.id;

//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.payment_status === "CANCELLED") {
//       return res.status(400).json({ message: "Order already cancelled" });
//     }

//     order.payment_status = "CANCELLED";
//     order.order_status = "cancelled";

//     await order.save();

//     const SalesReturn = require("../models/SalesReturn");

//     const items = order.products.map((p) => ({
//       product_id: p.product_id,
//       product_name: p.productDetails?.title,
//       quantity: p.qty,
//       return_amount: p.price * p.qty,
//     }));

//     await SalesReturn.create({
//       invoice_no: order._id,
//       invoice_number: order.internal_order_id,
//       invoice_date_time: order.createdAt,
//       customer_name: order.customer_details.fullName,
//       customer_phone: order.customer_details.phone,
//       items,
//       reason: "Order Cancelled by Customer",
//     });

//     res.json({
//       message: "Order cancelled successfully",
//       orderId: order._id
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Cancel failed" });
//   }
// };

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.payment_status === "CANCELLED") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    order.payment_status = "CANCELLED";
    order.order_status = "cancelled";

    await order.save();

    const SalesReturn = require("../models/SalesReturn");

    const items = (order.products || []).map((p) => ({
      product_id: p.product_id,
      product_name: p.productDetails?.title || "Product",
      quantity: p.qty,
      return_amount: p.price * p.qty,
    }));

    await SalesReturn.create({
      invoice_no: order._id,
      invoice_number: order.internal_order_id,
      invoice_date_time: order.createdAt,
      customer_name: order.customer_details?.fullName,
      customer_phone: order.customer_details?.phone,
      items,
      reason: "Order Cancelled by Customer",
    });

    res.json({
      message: "Order cancelled successfully",
      orderId: order._id
    });

  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({
      message: "Cancel failed",
      error: err.message
    });
  }
};