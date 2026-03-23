const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createOrder,
  verifyPayment,
  createCodOrder,
  cancelOrder,getCancelledOrders,getConfirmedOrders,getCancelledOrdersForReturn,createManualPaymentOrder,extractPaymentDetails
} = require("../controllers/orderController");
const { uploadPayment } = require("../middleware/upload");
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/create-cod-order", protect, createCodOrder);
router.patch("/:id/cancel", protect, cancelOrder);
router.get("/cancelled-orders", protect, getCancelledOrders);
router.get("/confirmed-orders", getConfirmedOrders);
router.get("/cancelled-orders-returns", getCancelledOrdersForReturn);
router.post(
  "/manual-payment",
  protect,
  uploadPayment.single("payment_proof"),
  createManualPaymentOrder
);
router.post(
  "/orders/extract-payment",
  upload.single("payment_proof"),
  extractPaymentDetails
);
module.exports = router;