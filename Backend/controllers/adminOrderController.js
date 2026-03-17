const Order = require("../models/Order");

/* =========================
   GET ALL ORDERS (ADMIN)
========================= */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    const formatted = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.internal_order_id,
      createdAt: order.createdAt,
      user: {
        name: order.customer_details?.fullName,
        email: order.customer_details?.email,
      },
      totalAmount: order.amount,

      // ✅ IMPORTANT
      
      orderStatus: order.order_status,
      paymentStatus: order.payment_status, 
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* =========================
   UPDATE ORDER STATUS
========================= */
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

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { order_status: status }, // ✅ IMPORTANT FIX
      { new: true }
    );

    res.json({ message: "Status updated", order });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* =========================
   UPDATE PAYMENT STATUS
========================= */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const allowedStatuses = [
      "SUCCESS",
      "PENDING",
      "FAILED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { payment_status: status },
      { new: true }
    );

    res.json({
      message: "Payment status updated",
      order,
    });

  } catch (err) {
    res.status(500).json({ message: "Payment update failed" });
  }
};

exports.editOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      req.body,
      { new: true }
    );

    res.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });

  } catch (err) {
    res.status(500).json({ message: "Edit failed" });
  }
};

/* =========================
   DELETE ORDER
========================= */
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    await Order.findByIdAndDelete(orderId);

    res.json({
      message: "Order deleted successfully",
    });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};