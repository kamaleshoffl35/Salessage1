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