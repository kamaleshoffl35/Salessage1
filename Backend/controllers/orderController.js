const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const crypto = require("crypto");

exports.createOrder = async (req, res) => {
  try {
    const { website, amount, currency, customer_details, products } = req.body;

    if (website !== "chakrapani") {
      return res.status(403).json({ error: "Invalid website" });
    }

    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      website,
      amount,
      customer_details,
      products,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const orderCount = await Order.countDocuments({ website });

    const internalId = `CHAKRA-2026-${String(orderCount + 1).padStart(4, "0")}`;

    const newOrder = await Order.create({
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

    res.json({ order_id: internalId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCodOrder = async (req, res) => {
  try {
    const { website, amount, customer_details, products } = req.body;

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

    res.json({ order_id: internalId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};