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
























// // exports.getMyOrders = async (req, res) => {
// //   try {
// //     const user = req.user;

// //     if (!user) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const tenant = req.headers["x-tenant-id"];

// //     if (!tenant) {
// //       return res.status(400).json({ message: "Tenant missing" });
// //     }

// //     const orders = await Order.find({
// //       website: tenant
// //     }).sort({ createdAt: -1 });

// //     const formattedOrders = orders.map((order) => ({
// //       _id: order._id,
// //       orderNumber: order.internal_order_id,
// //       createdAt: order.createdAt,
// //       orderStatus: order.order_status || "pending",
// //       paymentMethod: order.payment_mode?.toLowerCase(),
// //       paymentStatus: order.payment_status,
// //       shippingAddress: order.customer_details,
// //       subtotal: Math.round(order.amount / 1.18),
// //       tax: Math.round(order.amount - order.amount / 1.18),
// //       totalAmount: order.amount,

// //       items: (order.products || []).map((p) => ({
// //         productDetails: {
// //           title: p.productDetails?.title,
// //           image: p.productDetails?.image,
// //         },
// //         selectedSize: p.selectedSize,
// //         qty: p.qty,
// //         price: p.price,
// //       })),
// //     }));

// //     res.json(formattedOrders);

// //   } catch (error) {
// //     console.error("getMyOrders Error:", error);
// //     res.status(500).json({ message: "Failed to fetch orders" });
// //   }
// // };

// const Order = require("../models/Order");

// /* =========================
//    GET MY ORDERS
// ========================= */
// exports.getMyOrders = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const tenant = req.headers["x-tenant-id"];

//     if (!tenant) {
//       return res.status(400).json({ message: "Tenant missing" });
//     }

//     const orders = await Order.find({
//       website: tenant,
//       user: req.user._id,
//     })
//       .sort({ createdAt: -1 })
//       .lean();

//     const formattedOrders = orders.map((order) => {
//       const amount = order.amount || 0;

//       return {
//         _id: order._id,
//         orderNumber: order.internal_order_id || order._id,
//         createdAt: order.createdAt,
//         orderStatus: order.order_status || "pending",
//         paymentMethod: order.payment_mode?.toLowerCase() || "cod",
//         paymentStatus: order.payment_status || "pending",

//         shippingAddress: order.customer_details || {},

//         subtotal: Math.round(amount / 1.18),
//         tax: Math.round(amount - amount / 1.18),
//         totalAmount: amount,

//         items: (order.products || []).map((p) => ({
//           productDetails: {
//             title: p.productDetails?.title || "",
//             image: p.productDetails?.image || "",
//           },
//           selectedSize: p.selectedSize || null,
//           qty: p.qty || 1,
//           price: p.price || 0,
//         })),
//       };
//     });

//     res.status(200).json(formattedOrders);
//   } catch (error) {
//     console.error("❌ getMyOrders Error:", error);
//     res.status(500).json({
//       message: "Failed to fetch orders",
//       error: error.message,
//     });
//   }
// };