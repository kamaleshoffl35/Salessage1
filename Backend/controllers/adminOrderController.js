const Order = require("../models/Order");
// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });

//     const formatted = orders.map((order) => ({
//       _id: order._id,
//       orderNumber: order.internal_order_id,

//       createdAt: order.createdAt,
//       orderDate: new Date(order.createdAt).toLocaleString("en-IN"), // formatted date

//       user: {
//         name: order.customer_details?.fullName,
//         email: order.customer_details?.email,
//         phone: order.customer_details?.phone,
//         addressLine1: order.customer_details?.addressLine1,
//         city: order.customer_details?.city,
//         state: order.customer_details?.state,
//         postalCode: order.customer_details?.postalCode,
//         country: order.customer_details?.country,
//       },

//       products: order.products,

//       totalAmount: order.amount,
//       currency: order.currency,
//       paymentMode: order.payment_mode,

//       orderStatus: order.order_status,
//       paymentStatus: order.payment_status,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const formatted = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.internal_order_id,

      createdAt: order.createdAt,
      orderDate: new Date(order.createdAt).toLocaleString("en-IN"),

      user: {
        name: order.customer_details?.fullName,
        email: order.customer_details?.email,
        phone: order.customer_details?.phone,
        addressLine1: order.customer_details?.addressLine1,
        city: order.customer_details?.city,
        state: order.customer_details?.state,
        postalCode: order.customer_details?.postalCode,
        country: order.customer_details?.country,
      },

      products: order.products,

      totalAmount: order.amount,
      currency: order.currency,
      paymentMode: order.payment_mode,

      orderStatus: order.order_status,
      paymentStatus: order.payment_status,

      // ✅ ADD THIS
     paymentProof: order.payment_proof
  ? order.payment_proof.startsWith("http")
    ? order.payment_proof
    : `${process.env.BASE_URL}/uploads/${order.payment_proof}`
  : null,
    }));

    res.json(formatted);

  } catch (err) {
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

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { order_status: status }, 
      { new: true }
    );

    res.json({ message: "Status updated", order });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

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

