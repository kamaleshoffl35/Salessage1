const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createOrder,
  verifyPayment,
  createCodOrder,
  cancelOrder,getCancelledOrders,
} = require("../controllers/orderController");

router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/create-cod-order", protect, createCodOrder);
router.patch("/:id/cancel", protect, cancelOrder);
router.get("/cancelled-orders", protect, getCancelledOrders);
module.exports = router;