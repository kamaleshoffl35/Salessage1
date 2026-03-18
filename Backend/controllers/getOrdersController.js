// const Order=require("../models/Order")
// exports.getMyOrders = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const website = "chakkarapani";

//    const orders = await Order.find({
//   website,
//   "customer_details.email": user.email,
//   payment_status: { $ne: "CANCELLED" }
// }).sort({ createdAt: -1 });

//   const formattedOrders = orders.map((order) => ({
//   _id: order._id,
//   orderNumber: order.internal_order_id,
//   createdAt: order.createdAt,

//   // ✅ FIXED
//   orderStatus: order.order_status || "pending",

//   paymentMethod: order.payment_mode.toLowerCase(),

//   // ✅ FIXED
//   paymentStatus:
//     order.payment_status === "SUCCESS"
//       ? "success"
//       : "pending",

//   shippingAddress: order.customer_details,

//   subtotal: Math.round(order.amount / 1.18),
//   tax: Math.round(order.amount - order.amount / 1.18),
//   totalAmount: order.amount,

//   items: order.products.map((p) => ({
//     productDetails: {
//       title: p.productDetails?.title,
//       image: p.productDetails?.image,
//     },
//     selectedSize: p.selectedSize,
//     qty: p.qty,
//     price: p.price,
//   })),
// }));

//     res.json(formattedOrders);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };

// exports.getMyOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user?.email || !user?.tenant) {
//       return res.status(401).json({ message: "Unauthorized or tenant missing" });
//     }

//     const orders = await Order.find({
//       website: user.tenant,
//       "customer_details.email": user.email,
//       payment_status: { $ne: "CANCELLED" }
//     }).sort({ createdAt: -1 });

//     const formattedOrders = orders.map((order) => ({
//       _id: order._id,
//       orderNumber: order.internal_order_id,
//       createdAt: order.createdAt,
//       orderStatus: order.order_status || "pending",
//       paymentMethod: order.payment_mode.toLowerCase(),
//       paymentStatus: order.payment_status === "SUCCESS" ? "success" : "pending",
//       shippingAddress: order.customer_details,
//       subtotal: Math.round(order.amount / 1.18),
//       tax: Math.round(order.amount - order.amount / 1.18),
//       totalAmount: order.amount,
//       items: order.products.map((p) => ({
//         productDetails: {
//           title: p.productDetails?.title,
//           image: p.productDetails?.image,
//         },
//         selectedSize: p.selectedSize,
//         qty: p.qty,
//         price: p.price,
//       })),
//     }));

//     res.json(formattedOrders);
//   } catch (error) {
//     console.error("getMyOrders Error:", error);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };

// exports.getMyOrders = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!user?.tenant) {
//       return res.status(401).json({ message: "Tenant missing" });
//     }

//     const orders = await Order.find({
//       website: "chakkarapani"
//     }).sort({ createdAt: -1 });

//     const formattedOrders = orders.map((order) => ({
//       _id: order._id,
//       orderNumber: order.internal_order_id,
//       createdAt: order.createdAt,
//       orderStatus: order.order_status || "pending",
//       paymentMethod: order.payment_mode.toLowerCase(),
//       paymentStatus: order.payment_status,
//       shippingAddress: order.customer_details,
//       subtotal: Math.round(order.amount / 1.18),
//       tax: Math.round(order.amount - order.amount / 1.18),
//       totalAmount: order.amount,
//       items: order.products.map((p) => ({
//         productDetails: {
//           title: p.productDetails?.title,
//           image: p.productDetails?.image,
//         },
//         selectedSize: p.selectedSize,
//         qty: p.qty,
//         price: p.price,
//       })),
//     }));

//     res.json(formattedOrders);

//   } catch (error) {
//     console.error("getMyOrders Error:", error);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };

exports.getMyOrders = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tenant = user.tenant;

    if (!tenant) {
      return res.status(400).json({ message: "Tenant missing" });
    }

    const orders = await Order.find({
      website: tenant
    }).sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.internal_order_id,
      createdAt: order.createdAt,
      orderStatus: order.order_status || "pending",
      paymentMethod: order.payment_mode?.toLowerCase(),
      paymentStatus: order.payment_status,
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