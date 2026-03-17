

const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const crypto = require("crypto");

exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, customer_details, products } = req.body;

    const website = req.user?.tenant;

    if (!website) {
      return res.status(403).json({ error: "Invalid tenant" });
    }

    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID, 
    });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};

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


    const website = req.user?.tenant;

    if (!website) {
      return res.status(403).json({ error: "Invalid tenant" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const orderCount = await Order.countDocuments({ website });
    const internalId = `CHAKRA-2026-${String(orderCount + 1).padStart(4, "0")}`;

await Order.create({
  internal_order_id: internalId,
  website,

  payment_mode: "ONLINE",
  payment_status: "SUCCESS",
  order_status: "confirmed",

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
  order_status: "confirmed",

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

//     order.payment_status = "CANCELLED";
//     order.order_status = "cancelled";

//     await order.save();

//     const SalesReturn = require("../models/SalesReturn");

//     const orderProducts = order.products || order.items || [];

//     const items = orderProducts.map((p) => ({
//       product_id: p.product_id || p.productId,
//       product_name: p.product_name || p.productDetails?.title || "Product",
//       quantity: p.qty || p.quantity || 1,
//       return_amount: (p.price || 0) * (p.qty || p.quantity || 1),
//     }));

//     await SalesReturn.create({
//       invoice_no: order._id,
//       invoice_number: order.internal_order_id,
//       invoice_date_time: order.createdAt,
//       customer_name: order.customer_details?.fullName || "Customer",
//       customer_phone: order.customer_details?.phone || "",
//       items,
//       reason: "Order Cancelled by Customer",
//     });

//     res.json({
//       message: "Order cancelled successfully",
//       orderId: order._id,
//       order
//     });

//   } catch (err) {
//     console.error("Cancel Order Error:", err);

//     res.status(500).json({
//       message: "Cancel failed",
//       error: err.message,
//     });
//   }
// };

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.order_status === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // ✅ Step 1: Update order
    order.payment_status = "CANCELLED";
    order.order_status = "cancelled";

    await order.save();

    // ✅ Step 2: Handle SalesReturn SAFELY (no crash)
    try {
      const SalesReturn = require("../models/SalesReturn");

      const orderProducts = order.products || [];

      const items = orderProducts.map((p) => ({
        product_id: p.product_id || p.productId || null,
        product_name:
          p.product_name || p.productDetails?.title || "Product",
        quantity: p.qty || p.quantity || 1,
        return_amount:
          (p.price || 0) * (p.qty || p.quantity || 1),
      }));

      await SalesReturn.create({
        invoice_no: order._id,
        invoice_number: order.internal_order_id,
        invoice_date_time: order.createdAt,
        customer_name: order.customer_details?.fullName || "Customer",
        customer_phone: order.customer_details?.phone || "",
        items,
        reason: "Order Cancelled by Customer",
      });

    } catch (salesErr) {
      // 🔥 IMPORTANT: Don't break cancel flow
      console.error("SalesReturn Error:", salesErr.message);
    }

    // ✅ Step 3: Always send success
    return res.status(200).json({
      message: "Order cancelled successfully",
      orderId: order._id,
    });

  } catch (err) {
    console.error("Cancel Order Error:", err);

    return res.status(500).json({
      message: "Cancel failed",
      error: err.message,
    });
  }
};