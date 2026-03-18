const Order = require("../models/Order");
const SalesReturn = require("../models/SalesReturn");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, customer_details, products } = req.body;
    const website = req.user?.tenant;

    if (!website) return res.status(403).json({ error: "Invalid tenant" });

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

    if (!website) return res.status(403).json({ error: "Invalid tenant" });

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const orderCount = await Order.countDocuments({ website });
    const internalId = `CHAKRA-2026-${String(orderCount + 1).padStart(4, "0")}`;

    const order = await Order.create({
      internal_order_id: internalId,
      website,
      user: req.user._id,
      payment_mode: "ONLINE",
      payment_status: "SUCCESS",
      order_status: "confirmed",
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      customer_details,
      products,
    });

    res.json({ order_id: internalId, order });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

exports.createCodOrder = async (req, res) => {
  try {
    const { amount, customer_details, products } = req.body;
    const website = req.user?.tenant;

    if (!website) return res.status(403).json({ error: "Invalid tenant" });

    const orderCount = await Order.countDocuments({ website });
    const internalId = `CHAKRA-2026-${String(orderCount + 1).padStart(4, "0")}`;

    const order = await Order.create({
      internal_order_id: internalId,
      website,
      user: req.user._id,
      payment_mode: "COD",
      payment_status: "PENDING",
      order_status: "confirmed",
      amount,
      customer_details,
      products,
    });

    res.json({ order_id: internalId, order });
  } catch (err) {
    console.error("COD Order Error:", err);
    res.status(500).json({ error: "Failed to create COD order" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.order_status === "cancelled")
      return res.status(400).json({ message: "Order already cancelled" });

    order.order_status = "cancelled";
    order.payment_status = "CANCELLED";
    await order.save();
    if (order.products?.length) {
      try {
        const items = order.products.map((p) => ({
          product_id: p.product_id || p.productId || null,
          product_name: p.product_name || p.productDetails?.title || "Product",
          quantity: p.qty || p.quantity || 1,
          return_amount: (p.price || 0) * (p.qty || p.quantity || 1),
        }));

        await SalesReturn.create({
          invoice_no: order._id,
          invoice_number: order.internal_order_id,
          invoice_date_time: order.createdAt,
          customer_name: order.customer_details?.fullName || "Customer",
          customer_phone: order.customer_details?.phone || "",
          items,
          reason: "Order Cancelled",
        });
      } catch (salesErr) {
        console.error("SalesReturn Error:", salesErr.message);
      }
    }

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ message: "Cancel failed", error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const formatted = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.internal_order_id,
      createdAt: order.createdAt,
      user: {
        name: order.customer_details?.fullName,
        email: order.customer_details?.email,
        address: order.customer_details?.address,
      },
      totalAmount: order.amount,
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const user = req.user;

    if (!user?.email || !user?.tenant) {
      return res
        .status(401)
        .json({ message: "Unauthorized or tenant missing" });
    }

    const orders = await Order.find({
      website: user.tenant,
      "customer_details.email": user.email,
      payment_status: { $ne: "CANCELLED" },
    }).sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.internal_order_id,
      createdAt: order.createdAt,
      orderStatus: order.order_status || "pending",
      paymentMethod: order.payment_mode?.toLowerCase(),
      paymentStatus: order.payment_status === "SUCCESS" ? "success" : "pending",
      shippingAddress: order.customer_details,
      subtotal: Math.round(order.amount / 1.18),
      tax: Math.round(order.amount - order.amount / 1.18),
      totalAmount: order.amount,
      items: order.products.map((p) => ({
        productDetails: {
          title: p.productDetails?.title,
          image: p.productDetails?.image,
        },
        selectedSize: p.selectedSize,
        qty: p.qty,
        price: p.price,
      })),
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("getMyOrders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      { order_status: status },
      { new: true },
    );
    res.json({ message: "Status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const allowedStatuses = ["SUCCESS", "PENDING", "FAILED", "CANCELLED"];
    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid payment status" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      { payment_status: status },
      { new: true },
    );
    res.json({ message: "Payment status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment update failed" });
  }
};

exports.editOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
    });
    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Edit failed" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndDelete(orderId);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.getCancelledOrders = async (req, res) => {
  try {
    const cancelledOrders = await Order.find({
      order_status: "cancelled",
    }).sort({ createdAt: -1 });

    const formatted = cancelledOrders.map((order) => ({
      _id: order._id,
      orderNumber: order.internal_order_id,
      createdAt: order.createdAt,

      customer: {
        name: order.customer_details?.fullName,
        email: order.customer_details?.email,
        phone: order.customer_details?.phone,
      },

      totalAmount: order.amount,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,

      products: (order.products || []).map((p) => ({
        product_item_id: p._id,
        product_id: p.product?._id,

        title: p.productDetails?.title,
        image: p.productDetails?.image,
        category: p.productDetails?.category,

        dimension: p.selectedSize?.dimension,

        qty: p.qty,
        price: p.price,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Cancelled Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch cancelled orders" });
  }
};
